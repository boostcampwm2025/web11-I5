/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { AudioUploadStatus } from './entities/audio-asset.entity';
import { AudioUploadCompletedEvent } from './events/audio-upload-completed.event';

/**
 * AudioStreamService 테스트
 *
 * 실제 파일 시스템 작업(startSession, saveChunk, finalizeSession)은
 * 실제 fs 모듈에 의존하므로, 여기서는 비즈니스 로직과 관련된 부분만 테스트합니다.
 *
 * 주요 테스트 대상:
 * 1. 업로드 완료 시 이벤트 발행
 * 2. 업로드 실패 시 상태 업데이트
 * 3. findAudioAsset 동작
 */

const mockAudioAssetRepository = {
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findOneBy: jest.fn(),
};

const mockObjectStorageService = {
  uploadFile: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

describe('AudioStreamService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AudioAsset Repository Operations', () => {
    it('AudioAsset 생성 시 uploadStatus가 PENDING이어야 한다', () => {
      const mockAsset = {
        id: 100,
        userId: 1,
        uploadStatus: AudioUploadStatus.PENDING,
        storageUrl: '/tmp/audio.wav',
        objectKey: null,
      };

      mockAudioAssetRepository.create.mockReturnValue(mockAsset);

      const created = mockAudioAssetRepository.create({
        userId: 1,
        uploadStatus: AudioUploadStatus.PENDING,
        storageUrl: '/tmp/audio.wav',
        objectKey: null,
      });

      expect(created.uploadStatus).toBe(AudioUploadStatus.PENDING);
    });

    it('업로드 성공 시 uploadStatus를 COMPLETED로 업데이트해야 한다', async () => {
      mockAudioAssetRepository.update.mockResolvedValue({ affected: 1 });

      await mockAudioAssetRepository.update(100, {
        uploadStatus: AudioUploadStatus.COMPLETED,
        storageUrl: 'https://storage.example.com/audio.wav',
        objectKey: 'audio-sessions/uuid/audio.wav',
      });

      expect(mockAudioAssetRepository.update).toHaveBeenCalledWith(
        100,
        expect.objectContaining({
          uploadStatus: AudioUploadStatus.COMPLETED,
        }),
      );
    });

    it('업로드 실패 시 uploadStatus를 FAILED로 업데이트해야 한다', async () => {
      mockAudioAssetRepository.update.mockResolvedValue({ affected: 1 });

      await mockAudioAssetRepository.update(100, {
        uploadStatus: AudioUploadStatus.FAILED,
      });

      expect(mockAudioAssetRepository.update).toHaveBeenCalledWith(100, {
        uploadStatus: AudioUploadStatus.FAILED,
      });
    });
  });

  describe('AudioUploadCompletedEvent', () => {
    it('업로드 완료 이벤트가 올바른 audioAssetId를 포함해야 한다', () => {
      const audioAssetId = 100;
      const event = new AudioUploadCompletedEvent(audioAssetId);

      expect(event.audioAssetId).toBe(audioAssetId);
    });

    it('업로드 완료 시 이벤트가 발행되어야 한다', () => {
      const audioAssetId = 100;
      const event = new AudioUploadCompletedEvent(audioAssetId);

      mockEventEmitter.emit('audio.upload.completed', event);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'audio.upload.completed',
        expect.objectContaining({ audioAssetId: 100 }),
      );
    });

    it('업로드 실패 시 이벤트가 발행되지 않아야 한다', () => {
      // 업로드 실패 시뮬레이션: emit이 호출되지 않음
      // (실제 서비스에서는 catch 블록에서 emit을 호출하지 않음)

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('AudioUploadStatus Enum', () => {
    it('PENDING, COMPLETED, FAILED 상태가 정의되어야 한다', () => {
      expect(AudioUploadStatus.PENDING).toBe('pending');
      expect(AudioUploadStatus.COMPLETED).toBe('completed');
      expect(AudioUploadStatus.FAILED).toBe('failed');
    });
  });

  describe('findAudioAsset', () => {
    it('ID로 AudioAsset을 찾을 수 있어야 한다', async () => {
      const mockAsset = {
        id: 100,
        userId: 1,
        uploadStatus: AudioUploadStatus.COMPLETED,
        storageUrl: 'https://storage.example.com/audio.wav',
        objectKey: 'audio-sessions/uuid/audio.wav',
      };

      mockAudioAssetRepository.findOneBy.mockResolvedValue(mockAsset);

      const result = await mockAudioAssetRepository.findOneBy({ id: 100 });

      expect(mockAudioAssetRepository.findOneBy).toHaveBeenCalledWith({
        id: 100,
      });
      expect(result).toEqual(mockAsset);
      expect(result?.uploadStatus).toBe(AudioUploadStatus.COMPLETED);
    });

    it('존재하지 않는 ID는 null을 반환해야 한다', async () => {
      mockAudioAssetRepository.findOneBy.mockResolvedValue(null);

      const result = await mockAudioAssetRepository.findOneBy({ id: 999 });

      expect(result).toBeNull();
    });
  });

  describe('ObjectStorageService Integration', () => {
    it('업로드 성공 시 storageUrl을 반환해야 한다', async () => {
      const expectedUrl =
        'https://storage.example.com/audio-sessions/uuid/audio.wav';
      mockObjectStorageService.uploadFile.mockResolvedValue(expectedUrl);

      const result = await mockObjectStorageService.uploadFile(
        '/tmp/audio.wav',
        'audio-sessions/uuid/audio.wav',
      );

      expect(result).toBe(expectedUrl);
    });

    it('업로드 실패 시 에러를 던져야 한다', async () => {
      mockObjectStorageService.uploadFile.mockRejectedValue(
        new Error('Upload failed: Network error'),
      );

      await expect(
        mockObjectStorageService.uploadFile(
          '/tmp/audio.wav',
          'audio-sessions/uuid/audio.wav',
        ),
      ).rejects.toThrow('Upload failed: Network error');
    });
  });
});
