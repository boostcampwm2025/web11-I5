import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';

import { AudioAsset, AudioUploadStatus } from './entities/audio-asset.entity';
import { AudioUploadCompletedEvent } from './events/audio-upload-completed.event';
import { ObjectStorageService } from '../object-storage/object-storage.service';
import {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
  UploadCompleteRequestDto,
  UploadCompleteResponseDto,
} from './dtos';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    @InjectRepository(AudioAsset)
    private readonly audioAssetRepository: Repository<AudioAsset>,
    private readonly objectStorageService: ObjectStorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Presigned URL 발급 및 PENDING 상태 AudioAsset 생성
   */
  async requestPresignedUrl(
    userId: number,
    dto: PresignedUrlRequestDto,
  ): Promise<PresignedUrlResponseDto> {
    // 1. Object Key 생성 (UUID 기반)
    const sessionId = randomUUID();
    const objectKey = `audio-sessions/${sessionId}.m4a`;

    // 2. AudioAsset PENDING 상태로 미리 생성
    const audioAsset = this.audioAssetRepository.create({
      userId,
      storageUrl: '', // 업로드 완료 후 설정
      objectKey,
      uploadStatus: AudioUploadStatus.PENDING,
      byteSize: dto.estimatedSize?.toString() || '0',
      codec: dto.codec,
      sampleRate: dto.sampleRate,
      channels: dto.channels,
    });
    const savedAsset = await this.audioAssetRepository.save(audioAsset);

    // 3. Presigned PUT URL 생성
    const { uploadUrl, expiresIn } =
      await this.objectStorageService.createPresignedPutUrl(objectKey);

    this.logger.log(
      `Presigned URL issued for user ${userId}, assetId: ${savedAsset.id}`,
    );

    return {
      uploadUrl,
      objectKey,
      assetId: savedAsset.id,
      expiresIn,
    };
  }

  /**
   * 업로드 완료 확인 및 DB 확정
   */
  async confirmUpload(
    userId: number,
    dto: UploadCompleteRequestDto,
  ): Promise<UploadCompleteResponseDto> {
    // 1. AudioAsset 조회 및 소유권 검증
    const audioAsset = await this.audioAssetRepository.findOne({
      where: { id: dto.assetId, userId },
    });

    if (!audioAsset) {
      throw new NotFoundException(`AudioAsset ${dto.assetId} not found`);
    }

    if (audioAsset.uploadStatus !== AudioUploadStatus.PENDING) {
      throw new BadRequestException(
        `AudioAsset ${dto.assetId} is not in PENDING status`,
      );
    }

    if (!audioAsset.objectKey) {
      throw new BadRequestException(
        `AudioAsset ${dto.assetId} has no objectKey`,
      );
    }

    // 2. Object Storage에 HEAD 요청으로 파일 존재 확인
    const verification = await this.objectStorageService.verifyFileExists(
      audioAsset.objectKey,
    );

    if (!verification.exists) {
      throw new BadRequestException(
        `File not found in Object Storage for key: ${audioAsset.objectKey}`,
      );
    }

    // 3. 파일 크기 검증 (선택적 - 경고만)
    if (verification.contentLength && dto.byteSize) {
      const sizeDiff = Math.abs(verification.contentLength - dto.byteSize);
      const tolerance = dto.byteSize * 0.01; // 1% 허용
      if (sizeDiff > tolerance) {
        this.logger.warn(
          `File size mismatch for assetId ${dto.assetId}: expected=${dto.byteSize}, actual=${verification.contentLength}`,
        );
      }
    }

    // 4. DB 업데이트
    const storageUrl = this.objectStorageService.getPublicUrl(
      audioAsset.objectKey,
    );
    await this.audioAssetRepository.update(dto.assetId, {
      storageUrl,
      uploadStatus: AudioUploadStatus.COMPLETED,
      byteSize: (verification.contentLength || dto.byteSize).toString(),
      durationMs: dto.durationMs,
    });

    // 5. 업로드 완료 이벤트 발행 (STT 트리거)
    this.eventEmitter.emit(
      'audio.upload.completed',
      new AudioUploadCompletedEvent(dto.assetId),
    );

    this.logger.log(`Upload confirmed for assetId: ${dto.assetId}`);

    return {
      assetId: dto.assetId,
      storageUrl,
      uploadStatus: AudioUploadStatus.COMPLETED,
    };
  }
}
