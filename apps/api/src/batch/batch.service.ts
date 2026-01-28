import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AudioAsset,
  AudioUploadStatus,
} from '../uploads/entities/audio-asset.entity';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { ProcessStatus } from '../answer-submission/answer-submission.constants';
import { EvaluationStatus } from '../answer-evaluation/answer-evaluation.constants';
import { TIMEOUT_THRESHOLD_MS, TIMEOUT_CLEANUP_CRON } from './batch.constants';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    @InjectRepository(AudioAsset)
    private readonly audioAssetRepository: Repository<AudioAsset>,
    @InjectRepository(AnswerSubmission)
    private readonly answerSubmissionRepository: Repository<AnswerSubmission>,
  ) {}

  // 타임아웃된 업로드/STT/채점 작업을 FAILED로 변경하는 CRON 작업
  @Cron(TIMEOUT_CLEANUP_CRON)
  async handleTimeoutCleanup() {
    this.logger.log('타임아웃 정리 배치 작업 시작');

    try {
      const timeoutDate = new Date(Date.now() - TIMEOUT_THRESHOLD_MS);

      // AudioAsset uploadStatus 타임아웃 처리
      const uploadResult = await this.cleanupTimedOutUploads(timeoutDate);
      this.logger.log(
        `타임아웃된 업로드 ${uploadResult.affected || 0}건 정리 완료`,
      );

      // AnswerSubmission sttStatus 타임아웃 처리
      const sttResult = await this.cleanupTimedOutStt(timeoutDate);
      this.logger.log(`타임아웃된 STT ${sttResult.affected || 0}건 정리 완료`);

      // AnswerSubmission evaluationStatus 타임아웃 처리
      const evaluationResult =
        await this.cleanupTimedOutEvaluations(timeoutDate);
      this.logger.log(
        `타임아웃된 채점 ${evaluationResult.affected || 0}건 정리 완료`,
      );

      this.logger.log('타임아웃 정리 배치 작업 완료');
    } catch (error) {
      this.logger.error('타임아웃 정리 배치 작업 중 오류 발생', error);
    }
  }

  private async cleanupTimedOutUploads(timeoutDate: Date) {
    return this.audioAssetRepository
      .createQueryBuilder()
      .update(AudioAsset)
      .set({ uploadStatus: AudioUploadStatus.FAILED })
      .where('uploadStatus = :status', { status: AudioUploadStatus.PENDING })
      .andWhere('created_at < :timeoutDate', { timeoutDate })
      .execute();
  }

  private async cleanupTimedOutStt(timeoutDate: Date) {
    return this.answerSubmissionRepository
      .createQueryBuilder()
      .update(AnswerSubmission)
      .set({ sttStatus: ProcessStatus.FAILED })
      .where('sttStatus IN (:...statuses)', {
        statuses: [ProcessStatus.PENDING, ProcessStatus.IN_PROGRESS],
      })
      .andWhere('submitted_at < :timeoutDate', { timeoutDate })
      .execute();
  }

  private async cleanupTimedOutEvaluations(timeoutDate: Date) {
    return this.answerSubmissionRepository
      .createQueryBuilder()
      .update(AnswerSubmission)
      .set({ evaluationStatus: EvaluationStatus.FAILED })
      .where('evaluationStatus = :status', {
        status: EvaluationStatus.PENDING,
      })
      .andWhere('submitted_at < :timeoutDate', { timeoutDate })
      .execute();
  }
}
