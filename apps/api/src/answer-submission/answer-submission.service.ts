import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioAsset } from '../audio-stream/entities/audio-asset.entity';
import { Question } from '../question/entities/question.entity';
import { SttService } from '../stt/stt.service';
import { SubmitAnswerDto } from './dtos/submit-answer.dto';
import { UpdateImportanceDto } from './dtos/update-importance-rating.dto';

import {
  QuizMode,
  InputType,
  ProcessStatus,
} from './answer-submission.constants';
import { AnswerSubmission } from './entities/answer-submission.entity';
import { AnswerSubmissionResponseDto } from './dtos/answer-submission-response.dto';
import { EvaluationStatus } from 'src/answer-evaluation/answer-evaluation.constants';

interface AvgImportanceResult {
  avg: string | null;
}

@Injectable()
export class AnswerSubmissionService {
  private readonly logger = new Logger(AnswerSubmissionService.name);

  constructor(
    @InjectRepository(AnswerSubmission)
    private readonly answerSubmissionRepository: Repository<AnswerSubmission>,
    @InjectRepository(AudioAsset)
    private readonly audioAssetRepository: Repository<AudioAsset>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly sttService: SttService,
  ) {}

  async submitAnswer(
    userId: number,
    submitAnswerDto: SubmitAnswerDto,
  ): Promise<AnswerSubmission> {
    const { audioAssetId, questionId } = submitAnswerDto;

    // Validate audio asset exists and has objectKey
    const audioAsset = await this.audioAssetRepository.findOne({
      where: { id: audioAssetId },
    });

    if (!audioAsset) {
      throw new NotFoundException(
        `Audio asset with ID ${audioAssetId} not found`,
      );
    }

    if (!audioAsset.objectKey) {
      throw new BadRequestException(
        `Audio asset ${audioAssetId} not uploaded to object storage, missing objectKey`,
      );
    }

    // Validate question exists
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Create answer submission
    const answerSubmission = this.answerSubmissionRepository.create({
      userId,
      questionId,
      audioAssetId,
      quizMode: QuizMode.DAILY,
      inputType: InputType.VOICE,
      rawAnswer: '', // Will be filled by STT callback
      takenTime: audioAsset.durationMs ?? 0,
      sttStatus: ProcessStatus.PENDING,
      evaluationStatus: EvaluationStatus.PENDING,
    });

    const savedSubmission =
      await this.answerSubmissionRepository.save(answerSubmission);

    // Request STT asynchronously
    this.sttService.requestStt(audioAsset).catch(async (error) => {
      this.logger.error(
        `Failed to request STT for audioAssetId: ${audioAsset.id}`,
        error,
      );

      // Update submission status to FAILED when STT request fails
      try {
        savedSubmission.sttStatus = ProcessStatus.FAILED;
        await this.answerSubmissionRepository.save(savedSubmission);
        this.logger.warn(
          `Updated submission ${savedSubmission.id} sttStatus to FAILED due to STT request failure`,
        );
      } catch (updateError) {
        this.logger.error(
          `Failed to update submission ${savedSubmission.id} status after STT request failure`,
          updateError,
        );
      }
    });

    return savedSubmission;
  }

  async updateSttResult(
    audioAssetId: number,
    sttText: string,
    isSuccess: boolean,
  ): Promise<AnswerSubmission> {
    // Find submission by audioAssetId
    const submission = await this.answerSubmissionRepository.findOne({
      where: { audioAssetId },
    });

    if (!submission) {
      throw new NotFoundException(
        `Answer submission with audioAssetId ${audioAssetId} not found`,
      );
    }

    // Update submission with STT result
    submission.rawAnswer = sttText;
    submission.sttStatus = isSuccess
      ? ProcessStatus.DONE
      : ProcessStatus.FAILED;

    return await this.answerSubmissionRepository.save(submission);
  }

  async getHistoryListByQuestionId(
    userId: number,
    questionId: number,
  ): Promise<AnswerSubmissionResponseDto[]> {
    const submissions = await this.answerSubmissionRepository.find({
      where: {
        userId,
        questionId,
        quizMode: QuizMode.DAILY,
      },
      order: {
        submittedAt: 'ASC',
      },
    });

    return submissions.map((submission) => ({
      id: submission.id,
      questionId: submission.questionId,
      submittedAt: submission.submittedAt,
      audioAssetId: submission.audioAssetId,
      evaluationStatus: submission.evaluationStatus,
      sttStatus: submission.sttStatus,
      inputType: submission.inputType,
      answerContent: submission.rawAnswer,
      totalScore: submission.score,
      duration: submission.takenTime,
    }));
  }

  async getSubmissionById(id: number, userId: number) {
    const submission = await this.answerSubmissionRepository.findOne({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`ID가 ${id}인 제출 내역을 찾을 수 없습니다.`);
    }

    if (submission.userId !== userId) {
      throw new NotFoundException(`ID가 ${id}인 제출 내역을 찾을 수 없습니다.`);
    }

    return {
      id: submission.id,
      questionId: submission.questionId,
      submittedAt: submission.submittedAt,
      audioAssetId: submission.audioAssetId,
      evaluationStatus: submission.evaluationStatus,
      sttStatus: submission.sttStatus,
      inputType: submission.inputType,
      answerContent: submission.rawAnswer,
      totalScore: submission.score,
      duration: submission.takenTime,
    };
  }

  async updateImportance(
    userId: number,
    updateDto: UpdateImportanceDto,
  ): Promise<AnswerSubmission> {
    const { questionId, selfImportanceRating } = updateDto;

    // 해당 유저가 특정 문제에 대해 제출한 가장 최신 기록 조회
    const latestSubmission = await this.answerSubmissionRepository.findOne({
      where: { userId, questionId },
      order: { submittedAt: 'DESC' }, // 가장 최근에 제출한 것
    });

    if (!latestSubmission) {
      throw new NotFoundException(
        `유저 ID ${userId}의 질문 ${questionId}에 대한 제출 기록을 찾을 수 없습니다.`,
      );
    }

    latestSubmission.selfImportanceRating = selfImportanceRating;
    const savedSubmission =
      await this.answerSubmissionRepository.save(latestSubmission);

    this.calculateAvgImportance(questionId).catch((err) =>
      this.logger.error('평균 중요도 업데이트 실패', err),
    );

    return savedSubmission;
  }

  private async calculateAvgImportance(questionId: number): Promise<void> {
    const result = await this.answerSubmissionRepository
      .createQueryBuilder('submission')
      .select('AVG(submission.self_importance_rating)', 'avg')
      .where('submission.questionId = :questionId', { questionId })
      .andWhere('submission.self_importance_rating IS NOT NULL')
      .getRawOne<AvgImportanceResult>();

    const newAverage = result?.avg ? parseFloat(result.avg) : 0;

    await this.questionRepository.update(questionId, {
      avgImportance: newAverage,
    });
  }
}
