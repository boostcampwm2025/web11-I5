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
  AccuracyEval,
  DepthEval,
  EvaluationStatus,
  LogicEval,
} from './answer-evaluation.constants';
import { AnswerEvaluation } from './entities/answer-evaluation.entity';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { Question } from '../question/entities/question.entity';
import { QuestionSolution } from '../question-solution/entities/question-solution.entity';

interface AiEvaluationRawResponse {
  accuracy_level: AccuracyEval;
  accuracy_reason: string;
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
  ) {
    this.evaluationModel =
      this.configService.get<string>('GEMINI_EVALUATION_MODEL') ||
      LLM_MODELS.EVALUATION;
  }

  async evaluate(submissionId: number): Promise<{ evaluationId: number }> {
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
        accuracyEval: null,
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
  }

  /**
   * 답변 내용이 없는 경우의 처리
   */
  private async handleEmptyAnswer(
    submission: AnswerSubmission,
  ): Promise<{ evaluationId: number }> {
    const feedbackMessage =
      '답변 내용이 입력되지 않았습니다. 내용을 작성하신 후 제출해 주세요.';

    // 기존 evaluation이 있는지 확인
    let evaluation = await this.answerEvaluationRepository.findOne({
      where: { submissionId: submission.id },
    });

    if (!evaluation) {
      evaluation = this.answerEvaluationRepository.create({
        submissionId: submission.id,
      });
    }

    await this.dataSource.transaction(async (manager) => {
      // Evaluation 정보 업데이트 (최하위 점수 부여)
      await manager.save(AnswerEvaluation, {
        ...evaluation,
        feedbackMessage,
        detailAnalysis: {
          accuracy: '답변 내용이 없어 정확도를 측정할 수 없습니다.',
          logic: '답변 내용이 없어 논리 구성을 확인할 수 없습니다.',
          depth: '답변 내용이 없어 지식의 깊이를 측정할 수 없습니다.',
        },
        scoreDetails: { accuracy: 0, logic: 0, depth: 0 },
        accuracyEval: AccuracyEval.WRONG,
        logicEval: LogicEval.NONE,
        depthEval: DepthEval.NONE,
        extractedKeywords: [],
      });

      // Submission 상태 업데이트
      await manager.update(AnswerSubmission, submission.id, {
        evaluationStatus: EvaluationStatus.COMPLETED,
        score: 0,
      });
    });

    return { evaluationId: evaluation.id };
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
            accuracy: result.accuracyReason,
            logic: result.logicReason,
            depth: result.depthReason,
          },
          scoreDetails: result.scoreDetails,
          accuracyEval: result.accuracyLevel,
          logicEval: result.logicLevel,
          depthEval: result.depthLevel,
          extractedKeywords: result.extractedKeywords,
        });

        await manager.update(AnswerSubmission, submission.id, {
          evaluationStatus: EvaluationStatus.COMPLETED,
          score: totalScore,
        });
      });
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
      accuracyLevel: rawResponse.accuracy_level,
      accuracyReason: rawResponse.accuracy_reason,
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
    const accuracyMap: Record<AccuracyEval, number> = {
      [AccuracyEval.PERFECT]: 40,
      [AccuracyEval.GOOD]: 30,
      [AccuracyEval.MIXED]: 10,
      [AccuracyEval.WRONG]: 0,
    };
    const accuracyScore = accuracyMap[result.accuracyLevel] ?? 0;

    const logicMap: Record<LogicEval, number> = {
      [LogicEval.FLAWLESS]: 30,
      [LogicEval.COHERENT]: 20,
      [LogicEval.WEAK]: 10,
      [LogicEval.NONE]: 0,
    };
    const logicScore = logicMap[result.logicLevel] ?? 0;

    const depthMap: Record<DepthEval, number> = {
      [DepthEval.EXPERT]: 30,
      [DepthEval.ADVANCED]: 20,
      [DepthEval.BASIC]: 10,
      [DepthEval.NONE]: 0,
    };
    const depthScore = depthMap[result.depthLevel] ?? 0;

    const totalScore = accuracyScore + logicScore + depthScore;

    return {
      totalScore,
      scoreDetails: {
        accuracy: accuracyScore,
        logic: logicScore,
        depth: depthScore,
      },
    };
  }
}
