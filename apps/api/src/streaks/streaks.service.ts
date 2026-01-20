import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Streaks } from './entities/streaks.entity';

@Injectable()
export class StreaksService {
  constructor(
    @InjectRepository(Streaks)
    private readonly streaksRepository: Repository<Streaks>,
  ) {}

  async getYearlyActivityCount(
    userId: number,
    year: number,
  ): Promise<{ streakCount: number }> {
    const today = new Date();
    const start = new Date(`${year}-01-01`);
    const end =
      today.getFullYear() < year ? new Date(`${year}-12-31`) : new Date();
    const streakCount = await this.streaksRepository.count({
      where: {
        userId: userId,
        activityDate: Between(start, end),
      },
    });
    return { streakCount };
  }

  async getConsecutiveDayCount(
    userId: number,
  ): Promise<{ sequencyDailyCount: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); //시간으로 인해 이틀 뒤로 날짜가 밀리는것을 방지하기 위한 정규화

    const userStreaks = await this.streaksRepository.find({
      where: { userId },
      order: { activityDate: 'DESC' },
    });

    if (!userStreaks.length) {
      return { sequencyDailyCount: 0 };
    }

    let count = 0;

    const streakDates = new Set(
      userStreaks.map((streak) => {
        const date = new Date(streak.activityDate);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }),
    );

    const referenceDate = new Date(today);
    referenceDate.setDate(referenceDate.getDate() - 1);
    while (streakDates.has(referenceDate.getTime())) {
      count++;
      referenceDate.setDate(referenceDate.getDate() - 1);
    }
    if (streakDates.has(today.getTime())) {
      count++;
    }
    return { sequencyDailyCount: count };
  }

  async recordDailyActivity(userId: number): Promise<{ success: boolean }> {
    // 한국 시간으로 submittedAt 구하기 -> UTC + 9시간
    const utcDate = new Date();
    const submittedAt = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    const checkDay = await this.streaksRepository.findOneBy({
      userId: userId,
      activityDate: submittedAt,
    });
    if (checkDay) {
      return { success: true };
    }
    await this.streaksRepository.insert({
      userId: userId,
      activityDate: submittedAt,
    });
    return { success: true };
  }
}
