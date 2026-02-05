export interface SolvedProblem {
  questionId: number;
  title: string;
  category: string;
  completedAt: string;
  reportId: number;
  score: number;
}

export interface SolvedProblemsResDto {
  problems: SolvedProblem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}
