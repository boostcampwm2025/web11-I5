import {
  BadRequestException,
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
  is_complete_sentence: boolean;
  has_application: boolean;
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
      throw new BadRequestException('내용이 없는 답안은 채점할 수 없습니다.');
    }
    if (submission.evaluationStatus === EvaluationStatus.COMPLETED) {
      throw new ConflictException('이미 채점이 완료된 답안입니다.');
    }

    await this.answerSubmissionRepository.update(submissionId, {
      evaluationStatus: EvaluationStatus.PENDING,
    });

    // Evaluation Entity 먼저 생성
    const initialEvaluation = this.answerEvaluationRepository.create({
      submissionId,
      createdAt: new Date(),
    });

    const savedEvaluation =
      await this.answerEvaluationRepository.save(initialEvaluation);

    void this.aiEvaluate(savedEvaluation.id, submission);

    return { evaluationId: savedEvaluation.id };
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
          hasApplication: result.hasApplication,
          isCompleteSentence: result.isCompleteSentence,
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
      isCompleteSentence: rawResponse.is_complete_sentence,
      hasApplication: rawResponse.has_application,
      mentoringFeedback: rawResponse.mentoring_feedback,
      extractedKeywords: rawResponse.extracted_keywords,
    };
  }

  private calculateScore(result: EvaluationResultDto): {
    totalScore: number;
    scoreDetails: Required<EvaluationResultDto>['scoreDetails'];
  } {
    const accuracyMap: Record<AccuracyEval, number> = {
      [AccuracyEval.PERFECT]: 35,
      [AccuracyEval.MINOR_ERROR]: 20,
      [AccuracyEval.WRONG]: 0,
    };
    const accuracyScore = accuracyMap[result.accuracyLevel] ?? 0;

    const logicMap: Record<LogicEval, number> = {
      [LogicEval.CLEAR]: 30,
      [LogicEval.WEAK]: 15,
      [LogicEval.NONE]: 0,
    };
    const logicScore = logicMap[result.logicLevel] ?? 0;

    const depthMap: Record<DepthEval, number> = {
      [DepthEval.DEEP]: 25,
      [DepthEval.BASIC]: 10,
      [DepthEval.NONE]: 0,
    };
    const depthScore = depthMap[result.depthLevel] ?? 0;

    const completenessScore = result.isCompleteSentence ? 5 : 0;

    const applicationScore = result.hasApplication ? 5 : 0;

    const totalScore =
      accuracyScore +
      logicScore +
      depthScore +
      completenessScore +
      applicationScore;

    return {
      totalScore,
      scoreDetails: {
        accuracy: accuracyScore,
        logic: logicScore,
        depth: depthScore,
        completeness: completenessScore,
        application: applicationScore,
      },
    };
  }
}
