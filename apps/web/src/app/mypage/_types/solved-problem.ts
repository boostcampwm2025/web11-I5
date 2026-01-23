export interface SolvedProblem {
  questionId: number;
  title: string;
  category: string;
  completedAt: string;
  reportId: number;
  score: number;
}

export interface SolvedProblemResDto {
  problems: SolvedProblem[];
  totalCount: number;
}
