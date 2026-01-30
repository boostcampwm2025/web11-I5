import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LlmService } from '../llm/llm.service';
import { LLM_MODELS } from '../llm/llm.constants';
import { EVALUATION_SYSTEM_PROMPT } from '../llm/prompts/evaluation.prompt';
import { buildEvaluationUserPrompt } from '../llm/prompts/evaluation-user.prompt';
import { EvaluationResultDto } from './dtos/evaluation-result.dto';
import { EVALUATION_RESPONSE_SCHEMA } from '../llm/prompts/evaluation.schema';
import {
  CoreConceptEval,
  CoverageEval,
  DepthEval,
  EvaluationStatus,
  LogicEval,
} from './answer-evaluation.constants';
import { AnswerEvaluation } from './entities/answer-evaluation.entity';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { Question } from '../question/entities/question.entity';
import { QuestionSolution } from '../question-solution/entities/question-solution.entity';
import { GraphService } from '../graph/graph.service';

interface AiEvaluationRawResponse {
  core_concept_level: CoreConceptEval;
  core_concept_reason: string;
  coverage_level: CoverageEval;
  coverage_reason: string;
  logic_level: LogicEval;
  logic_reason: string;
  depth_level: DepthEval;
  depth_reason: string;
  mentoring_feedback: string;
  extracted_keywords: string[];
}

@Injectable()
export class AnswerEvaluationService {
  private readonly evaluationModel: string;
  private readonly logger = new Logger();

  constructor(
    private readonly llmService: LlmService,
    private readonly configService: ConfigService,
    @InjectRepository(AnswerEvaluation)
    private readonly answerEvaluationRepository: Repository<AnswerEvaluation>,
    @InjectRepository(AnswerSubmission)
    private readonly answerSubmissionRepository: Repository<AnswerSubmission>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(QuestionSolution)
    private readonly questionSolutionRepository: Repository<QuestionSolution>,
    private readonly dataSource: DataSource,
    private readonly graphService: GraphService,
  ) {
    this.evaluationModel =
      this.configService.get<string>('GEMINI_EVALUATION_MODEL') ||
      LLM_MODELS.EVALUATION;
  }

  async evaluate(
    submissionId: number,
  ): Promise<{ evaluationId: number } | void> {
    const submission = await this.answerSubmissionRepository.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException('저장된 답안을 찾을 수 없습니다.');
    }
    if (!submission.rawAnswer || submission.rawAnswer.trim().length === 0) {
      return await this.handleEmptyAnswer(submission);
    }
    if (submission.evaluationStatus === EvaluationStatus.COMPLETED) {
      throw new ConflictException('이미 채점이 완료된 답안입니다.');
    }

    try {
      await this.answerSubmissionRepository.update(submissionId, {
        evaluationStatus: EvaluationStatus.PENDING,
      });

      // 기존 evaluation 찾기
      let evaluation = await this.answerEvaluationRepository.findOne({
        where: { submissionId },
      });

      if (evaluation) {
        // 재채점: 기존 데이터 초기화
        await this.answerEvaluationRepository.update(evaluation.id, {
          feedbackMessage: null,
          detailAnalysis: null,
          scoreDetails: null,
          coreConceptEval: null,
          coverageEval: null,
          logicEval: null,
          depthEval: null,
          hasApplication: false,
          isCompleteSentence: false,
          extractedKeywords: [],
        });
      } else {
        // 첫 채점: 새로 생성
        evaluation = this.answerEvaluationRepository.create({
          submissionId,
        });
        evaluation = await this.answerEvaluationRepository.save(evaluation);
      }

      void this.aiEvaluate(evaluation.id, submission);

      return { evaluationId: evaluation.id };
    } catch (error) {
      // evaluation 준비 중 에러 발생 시 FAILED 처리
      this.logger.error(
        `Failed to prepare evaluation for submissionId: ${submissionId}`,
        error,
      );
      await this.answerSubmissionRepository.update(submissionId, {
        evaluationStatus: EvaluationStatus.FAILED,
      });
    }
  }

  /**
   * 답변 내용이 없는 경우의 처리
   */
  private async handleEmptyAnswer(
    submission: AnswerSubmission,
  ): Promise<{ evaluationId: number }> {
    const isVoice = submission.inputType === 'VOICE';
    const feedbackMessage = isVoice
      ? '음성 인식 결과가 없거나 답변이 비어 있습니다. 마이크 설정을 확인하고 다시 시도해 주세요.'
      : '답변 내용이 입력되지 않았습니다. 내용을 작성하신 후 제출해 주세요.';

    // 기존 evaluation이 있는지 확인
    let evaluation = await this.answerEvaluationRepository.findOne({
      where: { submissionId: submission.id },
    });

    if (!evaluation) {
      evaluation = this.answerEvaluationRepository.create({
        submissionId: submission.id,
      });
    }

    let savedEvaluationId: number;

    await this.dataSource.transaction(async (manager) => {
      // Evaluation 정보 업데이트 (최하위 점수 부여)
      const savedEvaluation = await manager.save(AnswerEvaluation, {
        ...evaluation,
        feedbackMessage,
        detailAnalysis: {
          coreConcept: '답변 내용이 없어 핵심 개념을 측정할 수 없습니다.',
          coverage: '답변 내용이 없어 완성도를 측정할 수 없습니다.',
          logic: '답변 내용이 없어 논리 구성을 확인할 수 없습니다.',
          depth: '답변 내용이 없어 지식의 깊이를 측정할 수 없습니다.',
        },
        scoreDetails: { coreConcept: 0, coverage: 0, logic: 0, depth: 0 },
        coreConceptEval: CoreConceptEval.WRONG,
        coverageEval: CoverageEval.MINIMAL,
        logicEval: LogicEval.NONE,
        depthEval: DepthEval.NONE,
        extractedKeywords: [],
      });

      savedEvaluationId = savedEvaluation.id;

      // Submission 상태 업데이트
      await manager.update(AnswerSubmission, submission.id, {
        evaluationStatus: EvaluationStatus.COMPLETED,
        score: 0,
      });
    });

    return { evaluationId: savedEvaluationId! };
  }

  /**
   * 평가 실행
   * @param submissionId 답변 제출 ID
   * @param submission 답안 엔티티
   */
  async aiEvaluate(
    evaluationId: number,
    submission: AnswerSubmission,
  ): Promise<void> {
    try {
      const questionEntity = await this.questionRepository.findOne({
        where: { id: submission.questionId },
      });
      if (!questionEntity) {
        throw new NotFoundException('문제를 찾을 수 없습니다.');
      }

      const solutionEntity = await this.questionSolutionRepository.findOne({
        where: { questionId: submission.questionId },
      });
      if (!solutionEntity) {
        throw new NotFoundException('모범 답안을 찾을 수 없습니다.');
      }

      const question = questionEntity.content;

      const solution = {
        standardDefinition: solutionEntity.standardDefinition,
        technicalMechanism: solutionEntity.technicalMechanism,
        keyTerminology: solutionEntity.keyTerminology,
        practicalApplication: solutionEntity.practicalApplication,
        misconceptions: solutionEntity.commonMisconceptions,
      };

      const userAnswer = submission.rawAnswer;

      const userPrompt = buildEvaluationUserPrompt({
        question,
        solution,
        userAnswer,
      });

      // AI로부터 snake_case 응답 수신
      const rawResponse =
        await this.llmService.callWithSchema<AiEvaluationRawResponse>(
          EVALUATION_SYSTEM_PROMPT,
          userPrompt,
          EVALUATION_RESPONSE_SCHEMA,
          { model: this.evaluationModel },
        );

      // camelCase로 변환
      const result: EvaluationResultDto = this.parseLlmResponse(rawResponse);

      // 점수 계산
      const { totalScore, scoreDetails } = this.calculateScore(result);
      result.totalScore = totalScore;
      result.scoreDetails = scoreDetails;

      // Entity 업데이트
      await this.dataSource.transaction(async (manager) => {
        await manager.update(AnswerEvaluation, evaluationId, {
          feedbackMessage: result.mentoringFeedback,
          detailAnalysis: {
            coreConcept: result.coreConceptReason,
            coverage: result.coverageReason,
            logic: result.logicReason,
            depth: result.depthReason,
          },
          scoreDetails: result.scoreDetails,
          coreConceptEval: result.coreConceptLevel,
          coverageEval: result.coverageLevel,
          logicEval: result.logicLevel,
          depthEval: result.depthLevel,
          extractedKeywords: result.extractedKeywords,
        });

        await manager.update(AnswerSubmission, submission.id, {
          evaluationStatus: EvaluationStatus.COMPLETED,
          score: totalScore,
        });
      });

      // 그래프 데이터 생성 (평가 완료 후 비동기로 처리)
      // 그래프 생성 실패는 평가 프로세스에 영향을 주지 않도록 별도로 처리
      if (result.extractedKeywords && result.extractedKeywords.length > 0) {
        void this.graphService
          .createGraphFromEvaluation(
            submission.userId,
            submission.questionId,
            questionEntity.title,
            result.extractedKeywords,
          )
          .catch((error) => {
            this.logger.error(
              `userId: ${submission.userId}, questionId: ${submission.questionId}에 대한 그래프 데이터 생성에 실패했습니다.`,
              error,
            );
          });
      }
    } catch (error) {
      this.logger.error(error);
      await this.answerSubmissionRepository.update(submission.id, {
        evaluationStatus: EvaluationStatus.FAILED,
      });
    }
  }

  async getEvaluationBySubmissionId(id: number) {
    const evaluation = await this.answerEvaluationRepository.findOne({
      where: { submissionId: id },
    });

    if (!evaluation) {
      throw new NotFoundException(
        '해당 답안에 대한 평가 결과를 찾을 수 없습니다.',
      );
    }

    return evaluation;
  }

  private parseLlmResponse(
    rawResponse: AiEvaluationRawResponse,
  ): EvaluationResultDto {
    return {
      coreConceptLevel: rawResponse.core_concept_level,
      coreConceptReason: rawResponse.core_concept_reason,
      coverageLevel: rawResponse.coverage_level,
      coverageReason: rawResponse.coverage_reason,
      logicLevel: rawResponse.logic_level,
      logicReason: rawResponse.logic_reason,
      depthLevel: rawResponse.depth_level,
      depthReason: rawResponse.depth_reason,
      mentoringFeedback: rawResponse.mentoring_feedback,
      extractedKeywords: rawResponse.extracted_keywords,
    };
  }

  private calculateScore(result: EvaluationResultDto): {
    totalScore: number;
    scoreDetails: Required<EvaluationResultDto>['scoreDetails'];
  } {
    const coreConceptMap: Record<CoreConceptEval, number> = {
      [CoreConceptEval.CORRECT]: 50,
      [CoreConceptEval.MINOR_ERROR]: 35,
      [CoreConceptEval.WRONG]: 0,
    };
    const coreConceptScore = coreConceptMap[result.coreConceptLevel] ?? 0;

    const coverageMap: Record<CoverageEval, number> = {
      [CoverageEval.COMPLETE]: 20,
      [CoverageEval.ADEQUATE]: 12,
      [CoverageEval.MINIMAL]: 5,
    };
    const coverageScore = coverageMap[result.coverageLevel] ?? 0;

    const logicMap: Record<LogicEval, number> = {
      [LogicEval.CLEAR]: 10,
      [LogicEval.WEAK]: 5,
      [LogicEval.NONE]: 0,
    };
    const logicScore = logicMap[result.logicLevel] ?? 0;

    const depthMap: Record<DepthEval, number> = {
      [DepthEval.ADVANCED]: 20,
      [DepthEval.BASIC]: 10,
      [DepthEval.NONE]: 0,
    };
    const depthScore = depthMap[result.depthLevel] ?? 0;

    const totalScore =
      coreConceptScore + coverageScore + logicScore + depthScore;

    return {
      totalScore,
      scoreDetails: {
        coreConcept: coreConceptScore,
        coverage: coverageScore,
        logic: logicScore,
        depth: depthScore,
      },
    };
  }
}
