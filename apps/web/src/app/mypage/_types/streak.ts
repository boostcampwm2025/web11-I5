interface YearlyAnswerSubmissions {
  id: number;
  submittedAt: string;
  questionid: number;
  title: string;
}
export interface StreakCountDto {
  submittedQuestionCount: number;
  yearlyAnswerSubmissions: YearlyAnswerSubmissions[];
}

export interface StreakSequenceDto {
  consecutiveDayCount: number;
}

export type StreaksDTO = StreakCountDto & StreakSequenceDto;
