/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { AudioAsset, AudioUploadStatus } from './entities/audio-asset.entity';
import { ObjectStorageService } from '../object-storage/object-storage.service';
import { PresignedUrlRequestDto, UploadCompleteRequestDto } from './dtos';

const mockAudioAssetRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockObjectStorageService = {
  createPresignedPutUrl: jest.fn(),
  verifyFileExists: jest.fn(),
  getPublicUrl: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('UploadsService', () => {
  let service: UploadsService;
  let audioAssetRepository: Repository<AudioAsset>;
  let objectStorageService: ObjectStorageService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: getRepositoryToken(AudioAsset),
          useValue: mockAudioAssetRepository,
        },
        {
          provide: ObjectStorageService,
          useValue: mockObjectStorageService,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        {
          provide: Logger,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    audioAssetRepository = module.get<Repository<AudioAsset>>(
      getRepositoryToken(AudioAsset),
    );
    objectStorageService =
      module.get<ObjectStorageService>(ObjectStorageService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPresignedUrl', () => {
    it('userId와 DTO로 Presigned URL 발급 및 PENDING AudioAsset을 생성해야 한다', async () => {
      const userId = 1;
      const dto: PresignedUrlRequestDto = {
        codec: 'pcm16',
        sampleRate: 16000,
        channels: 1,
        estimatedSize: 1024,
      };

      const mockSavedAsset = {
        id: 100,
        userId,
        objectKey: 'audio-sessions/some-uuid.wav',
        uploadStatus: AudioUploadStatus.PENDING,
        storageUrl: '',
        byteSize: '1024',
        codec: dto.codec,
        sampleRate: dto.sampleRate,
        channels: dto.channels,
      } as AudioAsset;

      mockAudioAssetRepository.create.mockImplementation(
        (data: Record<string, unknown>) =>
          ({ ...data }) as unknown as AudioAsset,
      );
      mockAudioAssetRepository.save.mockResolvedValue(mockSavedAsset);
      mockObjectStorageService.createPresignedPutUrl.mockResolvedValue({
        uploadUrl: 'https://presigned.put.url',
        expiresIn: 600,
      });

      const result = await service.requestPresignedUrl(userId, dto);

      expect(audioAssetRepository.create).toHaveBeenCalled();
      expect(audioAssetRepository.save).toHaveBeenCalled();
      expect(objectStorageService.createPresignedPutUrl).toHaveBeenCalledWith(
        expect.stringMatching(/^audio-sessions\/.+\.wav$/),
      );
      expect(result.uploadUrl).toBe('https://presigned.put.url');
      expect(result.assetId).toBe(100);
      expect(result.expiresIn).toBe(600);
      expect(result.objectKey).toMatch(/^audio-sessions\/.+\.wav$/);
    });
  });

  describe('confirmUpload', () => {
    it('유효한 assetId와 소유권이 있으면 업로드 완료 처리 후 이벤트를 발행해야 한다', async () => {
      const userId = 1;
      const dto: UploadCompleteRequestDto = {
        assetId: 100,
        byteSize: 2048,
        durationMs: 5000,
      };

      const mockAudioAsset = {
        id: 100,
        userId,
        objectKey: 'audio-sessions/uuid.wav',
        uploadStatus: AudioUploadStatus.PENDING,
        storageUrl: '',
      } as AudioAsset;

      mockAudioAssetRepository.findOne.mockResolvedValue(mockAudioAsset);
      mockObjectStorageService.verifyFileExists.mockResolvedValue({
        exists: true,
        contentLength: 2048,
      });
      mockObjectStorageService.getPublicUrl.mockReturnValue(
        'https://storage.example/bucket/audio-sessions/uuid.wav',
      );
      mockAudioAssetRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.confirmUpload(userId, dto);

      expect(audioAssetRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.assetId, userId },
      });
      expect(objectStorageService.verifyFileExists).toHaveBeenCalledWith(
        mockAudioAsset.objectKey,
      );
      expect(objectStorageService.getPublicUrl).toHaveBeenCalledWith(
        mockAudioAsset.objectKey,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'audio.upload.completed',
        expect.any(Object),
      );
      expect(result.assetId).toBe(100);
      expect(result.uploadStatus).toBe(AudioUploadStatus.COMPLETED);
      expect(result.storageUrl).toBe(
        'https://storage.example/bucket/audio-sessions/uuid.wav',
      );
    });

    it('AudioAsset이 없으면 NotFoundException을 발생시켜야 한다', async () => {
      const userId = 1;
      const dto: UploadCompleteRequestDto = { assetId: 999, byteSize: 100 };

      mockAudioAssetRepository.findOne.mockResolvedValue(null);

      await expect(service.confirmUpload(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.confirmUpload(userId, dto)).rejects.toThrow(
        'AudioAsset 999 not found',
      );
    });

    it('PENDING이 아닌 상태면 BadRequestException을 발생시켜야 한다', async () => {
      const userId = 1;
      const dto: UploadCompleteRequestDto = { assetId: 100, byteSize: 100 };

      const mockAudioAsset = {
        id: 100,
        userId,
        uploadStatus: AudioUploadStatus.COMPLETED,
        objectKey: 'key.wav',
      } as AudioAsset;

      mockAudioAssetRepository.findOne.mockResolvedValue(mockAudioAsset);

      await expect(service.confirmUpload(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirmUpload(userId, dto)).rejects.toThrow(
        'AudioAsset 100 is not in PENDING status',
      );
    });

    it('Object Storage에 파일이 없으면 BadRequestException을 발생시켜야 한다', async () => {
      const userId = 1;
      const dto: UploadCompleteRequestDto = { assetId: 100, byteSize: 100 };

      const mockAudioAsset = {
        id: 100,
        userId,
        objectKey: 'audio-sessions/uuid.wav',
        uploadStatus: AudioUploadStatus.PENDING,
      } as AudioAsset;

      mockAudioAssetRepository.findOne.mockResolvedValue(mockAudioAsset);
      mockObjectStorageService.verifyFileExists.mockResolvedValue({
        exists: false,
      });

      await expect(service.confirmUpload(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirmUpload(userId, dto)).rejects.toThrow(
        /File not found in Object Storage/,
      );
    });
  });
});
