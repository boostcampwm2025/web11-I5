import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerSubmission } from 'src/answer-submission/entities/answer-submission.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import {
  GetYearlyActivityCountResponseDto,
  YearlyAnswerSubmissionsDto,
} from './dtos/streaks-count.dto';
import { Streaks } from './entities/streaks.entity';

@Injectable()
export class StreaksService {
  constructor(
    @InjectRepository(Streaks)
    private readonly streaksRepository: Repository<Streaks>,
    @InjectRepository(AnswerSubmission)
    private readonly answerSubmissionRepository: Repository<AnswerSubmission>,
  ) {}

  private getKSTNow(): Date {
    return new Date(Date.now() + 9 * 60 * 60 * 1000);
  }

  private getKSTDateString(date?: Date): string {
    const d = date ?? this.getKSTNow();
    return d.toISOString().split('T')[0];
  }

  async getYearlyActivityCount(
    userId: number,
    year: number,
  ): Promise<GetYearlyActivityCountResponseDto> {
    const kstNow = this.getKSTNow();
    const kstYear = kstNow.getUTCFullYear();
    const start = new Date(`${year}-01-01T00:00:00+09:00`);
    const end =
      year < kstYear
        ? new Date(`${year + 1}-01-01T00:00:00+09:00`)
        : new Date();
    const rows = await this.answerSubmissionRepository
      .createQueryBuilder('submission')
      .distinctOn(['submission.questionId'])
      .innerJoin('submission.question', 'question')
      .select('submission.id', 'id')
      .addSelect('submission.submittedAt', 'submittedAt')
      .addSelect('submission.questionId', 'questionId')
      .addSelect('question.title', 'title')
      .where('submission.userId = :userId', { userId })
      .andWhere(
        'submission.submittedAt >= :start AND submission.submittedAt < :end',
        { start, end },
      )
      .orderBy('submission.questionId', 'ASC')
      .addOrderBy('submission.submittedAt', 'ASC')
      .addOrderBy('submission.id', 'DESC')
      .getRawMany<YearlyAnswerSubmissionsDto>();

    return {
      submittedQuestionCount: rows.length,
      yearlyAnswerSubmissions: rows,
    };
  }

  async getConsecutiveDayCount(
    userId: number,
  ): Promise<{ consecutiveDayCount: number }> {
    const kstNow = this.getKSTNow();
    const todayString = this.getKSTDateString(kstNow);
    const today = new Date(todayString);
    today.setHours(0, 0, 0, 0);

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const userStreaks = await this.streaksRepository.find({
      where: {
        userId,
        activityDate: MoreThanOrEqual(oneYearAgo),
      },
      order: { activityDate: 'DESC' },
    });

    if (!userStreaks.length) {
      return { consecutiveDayCount: 0 };
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
    return { consecutiveDayCount: count };
  }

  async recordDailyActivity(userId: number): Promise<{ success: boolean }> {
    const kstDateString = this.getKSTDateString();
    await this.streaksRepository.upsert(
      { userId, activityDate: new Date(kstDateString) },
      ['userId', 'activityDate'],
    );
    return { success: true };
  }
}
