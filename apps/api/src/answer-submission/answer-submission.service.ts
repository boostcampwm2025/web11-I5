import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluationStatus } from 'src/answer-evaluation/answer-evaluation.constants';
import { StreaksService } from 'src/streaks/streaks.service';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AudioAsset,
  AudioUploadStatus,
} from '../audio-stream/entities/audio-asset.entity';
import { Question } from '../question/entities/question.entity';
import { SttService } from '../stt/stt.service';
import {
  InputType,
  ProcessStatus,
  QuizMode,
} from './answer-submission.constants';
import { AnswerSubmissionResponseDto } from './dtos/answer-submission-response.dto';
import { AudioUploadCompletedEvent } from '../audio-stream/events/audio-upload-completed.event';
import { SubmitAnswerDto } from './dtos/submit-answer.dto';
import { AnswerSubmission } from './entities/answer-submission.entity';

@Injectable()
export class AnswerSubmissionService {
  constructor(
    @InjectRepository(AnswerSubmission)
    private readonly answerSubmissionRepository: Repository<AnswerSubmission>,
    @InjectRepository(AudioAsset)
    private readonly audioAssetRepository: Repository<AudioAsset>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly sttService: SttService,
    private readonly streaksService: StreaksService,
    private readonly logger: Logger,
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

    // 업로드 실패 상태만 거부 (PENDING은 허용)
    if (audioAsset.uploadStatus === AudioUploadStatus.FAILED) {
      throw new BadRequestException(
        `Audio asset ${audioAssetId} upload failed. Please re-record your answer.`,
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

    // 업로드 완료 상태일 때만 즉시 STT 요청
    // PENDING 상태면 업로드 완료 이벤트에서 STT 요청됨
    if (audioAsset.uploadStatus === AudioUploadStatus.COMPLETED) {
      // sttStatus를 IN_PROGRESS로 변경하여 중복 요청 방지
      savedSubmission.sttStatus = ProcessStatus.IN_PROGRESS;
      await this.answerSubmissionRepository.save(savedSubmission);

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
    } else {
      this.logger.log(
        `Audio asset ${audioAssetId} is still uploading. STT will be triggered after upload completes.`,
      );
    }

    try {
      await this.streaksService.recordDailyActivity(userId);
    } catch (error) {
      this.logger.error(
        `Failed to record daily activity for userId: ${userId}`,
        error,
      );
    }

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

  /**
   * 오디오 업로드 완료 이벤트 핸들러
   * 업로드 완료 시 해당 audioAssetId로 제출된 답변이 있고 STT가 아직 PENDING이면 STT 요청
   */
  @OnEvent('audio.upload.completed')
  async handleAudioUploadCompleted(
    event: AudioUploadCompletedEvent,
  ): Promise<void> {
    const { audioAssetId } = event;

    this.logger.log(
      `Received audio.upload.completed event for assetId: ${audioAssetId}`,
    );

    // 해당 audioAssetId로 제출된 답변 조회
    const submission = await this.answerSubmissionRepository.findOne({
      where: { audioAssetId },
    });

    if (!submission) {
      this.logger.log(
        `No submission found for audioAssetId: ${audioAssetId}. Skipping STT.`,
      );
      return;
    }

    // 멱등성 가드: sttStatus가 PENDING일 때만 STT 요청
    if (submission.sttStatus !== ProcessStatus.PENDING) {
      this.logger.log(
        `Submission ${submission.id} sttStatus is ${submission.sttStatus}, not PENDING. Skipping STT.`,
      );
      return;
    }

    // AudioAsset 조회
    const audioAsset = await this.audioAssetRepository.findOne({
      where: { id: audioAssetId },
    });

    if (!audioAsset) {
      this.logger.error(`AudioAsset not found for id: ${audioAssetId}`);
      return;
    }

    // STT 요청
    try {
      // sttStatus를 IN_PROGRESS로 변경하여 중복 요청 방지
      submission.sttStatus = ProcessStatus.IN_PROGRESS;
      await this.answerSubmissionRepository.save(submission);

      await this.sttService.requestStt(audioAsset);
      this.logger.log(
        `STT requested for audioAssetId: ${audioAssetId} after upload completed`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to request STT for audioAssetId: ${audioAssetId}`,
        error,
      );

      // STT 요청 실패 시 상태 업데이트
      submission.sttStatus = ProcessStatus.FAILED;
      await this.answerSubmissionRepository.save(submission);
    }
  }
}
