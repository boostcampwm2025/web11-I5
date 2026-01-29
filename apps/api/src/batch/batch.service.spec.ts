import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchService } from './batch.service';
import { AudioAsset } from '../uploads/entities/audio-asset.entity';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';

describe('BatchService', () => {
  let service: BatchService;
  let audioAssetRepository: Repository<AudioAsset>;
  let answerSubmissionRepository: Repository<AnswerSubmission>;

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        {
          provide: getRepositoryToken(AudioAsset),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(AnswerSubmission),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<BatchService>(BatchService);
    audioAssetRepository = module.get<Repository<AudioAsset>>(
      getRepositoryToken(AudioAsset),
    );
    answerSubmissionRepository = module.get<Repository<AnswerSubmission>>(
      getRepositoryToken(AnswerSubmission),
    );
  });

  describe('handleTimeoutCleanup', () => {
    beforeEach(() => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 2 });
    });

    it('타임아웃된 업로드/STT/채점 작업을 정리해야 함', async () => {
      await service.handleTimeoutCleanup();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(audioAssetRepository.createQueryBuilder).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(answerSubmissionRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('타임아웃 기준 시간으로 올바른 쿼리를 실행해야 함', async () => {
      const beforeTest = Date.now();
      await service.handleTimeoutCleanup();
      const afterTest = Date.now();

      // 세 가지 cleanup에 대해 set이 FAILED 상태로 호출되었는지 확인
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        uploadStatus: 'failed',
      });
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        sttStatus: 'FAILED',
      });
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        evaluationStatus: 'FAILED',
      });

      // where, andWhere 조건이 호출되었는지 확인
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();

      // andWhere가 타임아웃 날짜와 함께 호출되었는지 확인
      const andWhereCalls = mockQueryBuilder.andWhere.mock.calls as Array<
        [string, { timeoutDate?: Date }]
      >;
      expect(andWhereCalls.length).toBeGreaterThan(0);

      // 타임아웃 날짜가 대략적으로 올바른지 확인 (10분 전)
      const timeoutCall = andWhereCalls.find((call) => call[1]?.timeoutDate);
      if (timeoutCall && timeoutCall[1].timeoutDate) {
        const timeoutDate = timeoutCall[1].timeoutDate;
        const expectedMin = beforeTest - 10 * 60 * 1000 - 1000; // 1초 여유
        const expectedMax = afterTest - 10 * 60 * 1000 + 1000; // 1초 여유
        expect(timeoutDate.getTime()).toBeGreaterThanOrEqual(expectedMin);
        expect(timeoutDate.getTime()).toBeLessThanOrEqual(expectedMax);
      }
    });

    it('한 작업이 실패해도 다른 작업은 계속 실행되어야 함', async () => {
      // 첫 번째 호출만 실패하도록 설정
      mockQueryBuilder.execute
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce({ affected: 1 })
        .mockResolvedValueOnce({ affected: 1 });

      await expect(service.handleTimeoutCleanup()).resolves.not.toThrow();

      // 세 개의 cleanup 함수가 모두 호출되었는지 확인
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(audioAssetRepository.createQueryBuilder).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(answerSubmissionRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('모든 작업이 실패해도 예외가 throw되지 않아야 함', async () => {
      mockQueryBuilder.execute.mockRejectedValue(new Error('Database error'));

      await expect(service.handleTimeoutCleanup()).resolves.not.toThrow();
    });
  });
});
