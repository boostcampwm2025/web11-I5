import { PaginatedSubmissionDTO } from "@/app/daily/questions/[questionId]/others/_types/types";

export const mockOthersSubmissions: PaginatedSubmissionDTO = {
  question: {
    id: 1,
    title: "TCP와 UDP의 차이점을 설명하세요",
    content: "",
    ttsUrl: null,
    avgScore: 85,
    avgImportance: 4.5,
    categoryId: 11,
    category: {
      id: 11,
      name: "TCP/IP",
      depth: 1,
      parentId: 1,
      parent: {
        id: 1,
        name: "네트워크",
        depth: 0,
        parentId: null,
      },
    },
    score: null,
  },
  submissions: [
    {
      submissionId: 101,
      nickname: "김철수",
      totalScore: 95,
      submittedAt: "2025-01-15T10:30:00Z",
    },
    {
      submissionId: 102,
      nickname: "이영희",
      totalScore: 88,
      submittedAt: "2025-01-14T14:20:00Z",
    },
    {
      submissionId: 103,
      nickname: "박민수",
      totalScore: 72,
      submittedAt: "2025-01-13T09:15:00Z",
    },
    {
      submissionId: 104,
      nickname: "최지은",
      totalScore: 65,
      submittedAt: "2025-01-12T16:45:00Z",
    },
    {
      submissionId: 105,
      nickname: "정대호",
      totalScore: 82,
      submittedAt: "2025-01-11T11:00:00Z",
    },
  ],
  totalCount: 5,
  pageSize: 10,
  currentPage: 1,
  totalPages: 1,
};

export const mockOthersSubmissionsEmpty: PaginatedSubmissionDTO = {
  question: {
    id: 2,
    title: "HTTP와 HTTPS의 차이점은 무엇인가요?",
    content: "",
    ttsUrl: null,
    avgScore: 78,
    avgImportance: 4.0,
    categoryId: 12,
    category: {
      id: 12,
      name: "HTTP",
      depth: 1,
      parentId: 1,
      parent: {
        id: 1,
        name: "네트워크",
        depth: 0,
        parentId: null,
      },
    },
    score: null,
  },
  submissions: [],
  totalCount: 0,
  pageSize: 10,
  currentPage: 1,
  totalPages: 0,
};
