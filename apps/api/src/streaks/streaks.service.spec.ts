/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnswerSubmissionService } from 'src/answer-submission/answer-submission.service';
import { Streaks } from './entities/streaks.entity';
import { StreaksService } from './streaks.service';

describe('StreaksService', () => {
  let service: StreaksService;

  const mockStreaksRepository = {
    find: jest.fn(),
    upsert: jest.fn(),
  };

  const mockAnswerSubmissionService = {
    getDistinctQuestionsByYear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreaksService,
        {
          provide: getRepositoryToken(Streaks),
          useValue: mockStreaksRepository,
        },
        {
          provide: AnswerSubmissionService,
          useValue: mockAnswerSubmissionService,
        },
      ],
    }).compile();

    service = module.get<StreaksService>(StreaksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('getYearlyActivityCount', () => {
    it('데이터가 없으면 submittedQuestionCount 0과 빈 배열을 리턴한다', async () => {
      mockAnswerSubmissionService.getDistinctQuestionsByYear.mockResolvedValue(
        [],
      );

      const result = await service.getYearlyActivityCount(1, 2026);

      expect(result).toEqual({
        submittedQuestionCount: 0,
        yearlyAnswerSubmissions: [],
      });
    });

    it('고유 문제 5개가 있으면 submittedQuestionCount 5를 리턴한다', async () => {
      const mockRows = [
        {
          id: 1,
          submittedAt: new Date('2026-01-01'),
          questionId: 1,
          title: '문제1',
        },
        {
          id: 2,
          submittedAt: new Date('2026-01-02'),
          questionId: 2,
          title: '문제2',
        },
        {
          id: 3,
          submittedAt: new Date('2026-01-03'),
          questionId: 3,
          title: '문제3',
        },
        {
          id: 4,
          submittedAt: new Date('2026-01-04'),
          questionId: 4,
          title: '문제4',
        },
        {
          id: 5,
          submittedAt: new Date('2026-01-05'),
          questionId: 5,
          title: '문제5',
        },
      ];
      mockAnswerSubmissionService.getDistinctQuestionsByYear.mockResolvedValue(
        mockRows,
      );

      const result = await service.getYearlyActivityCount(1, 2026);

      expect(result).toEqual({
        submittedQuestionCount: 5,
        yearlyAnswerSubmissions: mockRows,
      });
    });

    it('과거 연도를 조회하면 해당 연도의 날짜 범위로 서비스를 호출한다', async () => {
      mockAnswerSubmissionService.getDistinctQuestionsByYear.mockResolvedValue(
        [],
      );

      await service.getYearlyActivityCount(1, 2025);

      expect(
        mockAnswerSubmissionService.getDistinctQuestionsByYear,
      ).toHaveBeenCalledWith(
        1,
        new Date('2025-01-01T00:00:00+09:00'),
        new Date('2026-01-01T00:00:00+09:00'),
      );
    });

    it('userId를 필터 조건으로 사용한다', async () => {
      mockAnswerSubmissionService.getDistinctQuestionsByYear.mockResolvedValue(
        [],
      );

      await service.getYearlyActivityCount(42, 2026);

      expect(
        mockAnswerSubmissionService.getDistinctQuestionsByYear,
      ).toHaveBeenCalledWith(42, expect.any(Date), expect.any(Date));
    });
  });

  describe('getConsecutiveDayCount', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-08T00:00:00.000Z'));
    });

    it('오늘이 2026.01.08일 때 01.01~01.07까지 스트릭을 갱신했다면 7을 리턴한다', async () => {
      const mockData = [
        { id: 7, userId: 1, activityDate: new Date('2026-01-07') },
        { id: 6, userId: 1, activityDate: new Date('2026-01-06') },
        { id: 5, userId: 1, activityDate: new Date('2026-01-05') },
        { id: 4, userId: 1, activityDate: new Date('2026-01-04') },
        { id: 3, userId: 1, activityDate: new Date('2026-01-03') },
        { id: 2, userId: 1, activityDate: new Date('2026-01-02') },
        { id: 1, userId: 1, activityDate: new Date('2026-01-01') },
      ];
      mockStreaksRepository.find.mockResolvedValue(mockData);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ consecutiveDayCount: 7 });
    });

    it('오늘이 2026.01.08일 때 01.01~01.08까지 스트릭을 갱신했다면 8을 리턴한다', async () => {
      const mockData = [
        { id: 8, userId: 1, activityDate: new Date('2026-01-08') },
        { id: 7, userId: 1, activityDate: new Date('2026-01-07') },
        { id: 6, userId: 1, activityDate: new Date('2026-01-06') },
        { id: 5, userId: 1, activityDate: new Date('2026-01-05') },
        { id: 4, userId: 1, activityDate: new Date('2026-01-04') },
        { id: 3, userId: 1, activityDate: new Date('2026-01-03') },
        { id: 2, userId: 1, activityDate: new Date('2026-01-02') },
        { id: 1, userId: 1, activityDate: new Date('2026-01-01') },
      ];
      mockStreaksRepository.find.mockResolvedValue(mockData);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ consecutiveDayCount: 8 });
    });

    it('오늘이 2026.01.08일 때 01.01~01.06까지 스트릭을 갱신했다면 0을 리턴한다', async () => {
      const mockData = [
        { id: 6, userId: 1, activityDate: new Date('2026-01-06') },
        { id: 5, userId: 1, activityDate: new Date('2026-01-05') },
        { id: 4, userId: 1, activityDate: new Date('2026-01-04') },
        { id: 3, userId: 1, activityDate: new Date('2026-01-03') },
        { id: 2, userId: 1, activityDate: new Date('2026-01-02') },
        { id: 1, userId: 1, activityDate: new Date('2026-01-01') },
      ];
      mockStreaksRepository.find.mockResolvedValue(mockData);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ consecutiveDayCount: 0 });
    });

    it('스트릭 데이터가 없다면 0을 리턴한다', async () => {
      mockStreaksRepository.find.mockResolvedValue([]);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ consecutiveDayCount: 0 });
    });

    it('오늘이 2026.01.08일 때 01.06이 없고 01.07~01.08만 있으면 2를 리턴한다', async () => {
      const mockData = [
        { id: 2, userId: 1, activityDate: new Date('2026-01-08') },
        { id: 1, userId: 1, activityDate: new Date('2026-01-07') },
      ];
      mockStreaksRepository.find.mockResolvedValue(mockData);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ consecutiveDayCount: 2 });
    });

    it('오늘이 2026.01.08일 때 오늘(01.08)만 있으면 1을 리턴한다', async () => {
      const mockData = [
        { id: 1, userId: 1, activityDate: new Date('2026-01-08') },
      ];
      mockStreaksRepository.find.mockResolvedValue(mockData);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ consecutiveDayCount: 1 });
    });

    it('오늘이 2026.01.08일 때 어제(01.07)만 있으면 1을 리턴한다', async () => {
      const mockData = [
        { id: 1, userId: 1, activityDate: new Date('2026-01-07') },
      ];
      mockStreaksRepository.find.mockResolvedValue(mockData);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ consecutiveDayCount: 1 });
    });

    it('최근 365일 이내 데이터만 조회한다', async () => {
      mockStreaksRepository.find.mockResolvedValue([]);

      await service.getConsecutiveDayCount(1);

      expect(mockStreaksRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 1,
            activityDate: expect.anything(),
          }),
          order: { activityDate: 'DESC' },
        }),
      );
    });
  });

  describe('recordDailyActivity', () => {
    it('upsert를 호출하고 success: true를 리턴한다', async () => {
      mockStreaksRepository.upsert.mockResolvedValue({} as any);

      const result = await service.recordDailyActivity(1);

      expect(mockStreaksRepository.upsert).toHaveBeenCalledWith(
        {
          userId: 1,
          activityDate: expect.any(Date),
        },
        ['userId', 'activityDate'],
      );
      expect(result).toEqual({ success: true });
    });

    it('중복 호출 시에도 upsert로 안전하게 처리한다', async () => {
      mockStreaksRepository.upsert.mockResolvedValue({} as any);

      const result1 = await service.recordDailyActivity(1);
      const result2 = await service.recordDailyActivity(1);

      expect(mockStreaksRepository.upsert).toHaveBeenCalledTimes(2);
      expect(result1).toEqual({ success: true });
      expect(result2).toEqual({ success: true });
    });
  });
});
