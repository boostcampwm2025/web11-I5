/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Streaks } from './entities/streaks.entity';
import { StreaksService } from './streaks.service';

describe('StreaksService', () => {
  let service: StreaksService;

  const mockStreaksRepository = {
    count: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    insert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreaksService,
        {
          provide: getRepositoryToken(Streaks),
          useValue: mockStreaksRepository,
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
    it('2026년 기준으로 데이터가 없으면 0이 리턴된다', async () => {
      mockStreaksRepository.count.mockResolvedValue(0);

      const result = await service.getYearlyActivityCount(1, 2026);

      expect(result).toEqual({ streakCount: 0 });
    });

    it('2026년 기준으로 데이터가 5개 있으면 5가 리턴된다', async () => {
      mockStreaksRepository.count.mockResolvedValue(5);

      const result = await service.getYearlyActivityCount(1, 2026);

      expect(result).toEqual({ streakCount: 5 });
    });

    it('2025년 기준으로 데이터가 없으면 0을 리턴한다', async () => {
      mockStreaksRepository.count.mockResolvedValue(0);

      const result = await service.getYearlyActivityCount(1, 2025);

      expect(result).toEqual({ streakCount: 0 });
    });

    it('2025년 기준으로 데이터가 5개 있으면 5를 리턴한다', async () => {
      mockStreaksRepository.count.mockResolvedValue(5);

      const result = await service.getYearlyActivityCount(1, 2025);

      expect(result).toEqual({ streakCount: 5 });
    });

    it('2025년 3개 + 2026년 5개 혼합 시 2026년 조회하면 5를 리턴한다', async () => {
      mockStreaksRepository.count.mockResolvedValue(5);

      const result = await service.getYearlyActivityCount(1, 2026);

      expect(result).toEqual({ streakCount: 5 });
    });

    it('userId별로 데이터를 구분하여 조회한다', async () => {
      mockStreaksRepository.count.mockResolvedValue(5);

      const result = await service.getYearlyActivityCount(1, 2026);

      expect(mockStreaksRepository.count).toHaveBeenCalled();
      expect(result).toEqual({ streakCount: 5 });
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

      expect(result).toEqual({ sequencyDailyCount: 7 });
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

      expect(result).toEqual({ sequencyDailyCount: 8 });
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

      expect(result).toEqual({ sequencyDailyCount: 0 });
    });

    it('스트릭 데이터가 없다면 0을 리턴한다', async () => {
      mockStreaksRepository.find.mockResolvedValue([]);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ sequencyDailyCount: 0 });
    });

    it('오늘이 2026.01.08일 때 01.06이 없고 01.07~01.08만 있으면 2를 리턴한다', async () => {
      const mockData = [
        { id: 2, userId: 1, activityDate: new Date('2026-01-08') },
        { id: 1, userId: 1, activityDate: new Date('2026-01-07') },
      ];
      mockStreaksRepository.find.mockResolvedValue(mockData);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ sequencyDailyCount: 2 });
    });

    it('오늘이 2026.01.08일 때 오늘(01.08)만 있으면 1을 리턴한다', async () => {
      const mockData = [
        { id: 1, userId: 1, activityDate: new Date('2026-01-08') },
      ];
      mockStreaksRepository.find.mockResolvedValue(mockData);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ sequencyDailyCount: 1 });
    });

    it('오늘이 2026.01.08일 때 어제(01.07)만 있으면 1을 리턴한다', async () => {
      const mockData = [
        { id: 1, userId: 1, activityDate: new Date('2026-01-07') },
      ];
      mockStreaksRepository.find.mockResolvedValue(mockData);

      const result = await service.getConsecutiveDayCount(1);

      expect(result).toEqual({ sequencyDailyCount: 1 });
    });
  });

  describe('recordDailyActivity', () => {
    it('스트릭 데이터가 조회되지 않으면 데이터를 추가하고 true를 리턴한다', async () => {
      mockStreaksRepository.findOneBy.mockResolvedValue(null);
      mockStreaksRepository.insert.mockResolvedValue({} as any);

      const result = await service.recordDailyActivity(1);

      expect(mockStreaksRepository.findOneBy).toHaveBeenCalledWith({
        userId: 1,
        activityDate: expect.any(Date),
      });
      expect(mockStreaksRepository.insert).toHaveBeenCalledWith({
        userId: 1,
        activityDate: expect.any(Date),
      });
      expect(result).toEqual({ success: true });
    });

    it('스트릭 데이터가 이미 조회된다면 데이터를 조작하지 않고 true를 리턴한다', async () => {
      const existingStreak = {
        id: 1,
        userId: 1,
        activityDate: new Date(),
      };
      mockStreaksRepository.findOneBy.mockResolvedValue(existingStreak);

      const result = await service.recordDailyActivity(1);

      expect(mockStreaksRepository.findOneBy).toHaveBeenCalledWith({
        userId: 1,
        activityDate: expect.any(Date),
      });
      expect(mockStreaksRepository.insert).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
});
