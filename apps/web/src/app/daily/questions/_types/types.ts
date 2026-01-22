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

export interface PaginatedQuestionsDTO {
  questions: Question[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}
