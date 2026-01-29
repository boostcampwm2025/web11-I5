export interface Category {
  id: number;
  name: string;
  depth: number;
  parentId: number | null;
  parent?: Category;
  children?: Category[];
}

export interface Question {
  id: number;
  title: string;
  content: string;
  ttsUrl: string | null;
  avgScore: number;
  avgImportance: number;
  categoryId: number;
  category?: Category;
  score: number | null;
}

export interface Submission {
  submissionId: number;
  nickname: string;
  totalScore: number;
  submittedAt: string;
}

export interface OthersSubmissionDetail {
  id: number;
  questionId: number;
  submittedAt: string;
  audioAssetId: number;
  evaluationStatus: string;
  sttStatus: string;
  inputType: string;
  answerContent: string;
  totalScore: number;
  duration: number;
}

export interface PaginatedSubmissionDTO {
  question: Question;
  submissions: Submission[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface OthersSubmissionDTO {
  nickname: string;
  question: Question;
  submission: OthersSubmissionDetail;
  keywords: string[];
}
