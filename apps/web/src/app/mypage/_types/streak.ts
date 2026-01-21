export interface StreakCountDto {
  streakCount: number;
}

export interface StreakSequenceDto {
  consecutiveDayCount: number;
}

export type StreaksDTO = StreakCountDto & StreakSequenceDto;
