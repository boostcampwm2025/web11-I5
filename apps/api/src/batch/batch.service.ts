import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
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
    const timeoutDate = new Date(Date.now() - TIMEOUT_THRESHOLD_MS);

    // 각 작업의 실패가 서로에게 영향을 주지 않도록 독립적으로 실행
    await this.safeExecute('업로드', () =>
      this.cleanupTimedOutUploads(timeoutDate),
    );
    await this.safeExecute('STT', () => this.cleanupTimedOutStt(timeoutDate));
    await this.safeExecute('채점', () =>
      this.cleanupTimedOutEvaluations(timeoutDate),
    );

    this.logger.log('타임아웃 정리 배치 작업 완료');
  }

  // 개별 작업의 에러를 캡처하여 전체 배치가 중단되지 않도록 보장하는 헬퍼 메서드
  private async safeExecute(label: string, task: () => Promise<UpdateResult>) {
    try {
      const result = await task();
      this.logger.log(
        `타임아웃된 ${label} ${result.affected || 0}건 정리 완료`,
      );
    } catch (error) {
      this.logger.error(
        `${label} 타임아웃 정리 중 오류 발생`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async cleanupTimedOutUploads(timeoutDate: Date) {
    return this.audioAssetRepository
      .createQueryBuilder('audioAsset')
      .update(AudioAsset)
      .set({ uploadStatus: AudioUploadStatus.FAILED })
      .where('audioAsset.uploadStatus = :status', {
        status: AudioUploadStatus.PENDING,
      })
      .andWhere('audioAsset.createdAt < :timeoutDate', { timeoutDate })
      .execute();
  }

  private async cleanupTimedOutStt(timeoutDate: Date) {
    return this.answerSubmissionRepository
      .createQueryBuilder('submission')
      .update(AnswerSubmission)
      .set({ sttStatus: ProcessStatus.FAILED })
      .where('submission.sttStatus IN (:...statuses)', {
        statuses: [ProcessStatus.PENDING, ProcessStatus.IN_PROGRESS],
      })
      .andWhere('submission.submittedAt < :timeoutDate', { timeoutDate })
      .execute();
  }

  private async cleanupTimedOutEvaluations(timeoutDate: Date) {
    return this.answerSubmissionRepository
      .createQueryBuilder('submission')
      .update(AnswerSubmission)
      .set({ evaluationStatus: EvaluationStatus.FAILED })
      .where('submission.evaluationStatus = :status', {
        status: EvaluationStatus.PENDING,
      })
      .andWhere('submission.sttStatus = :sttStatus', {
        sttStatus: ProcessStatus.DONE,
      })
      .andWhere('submission.submittedAt < :timeoutDate', { timeoutDate })
      .execute();
  }
}
