import {
  OthersSubmissionDTO,
  PaginatedSubmissionDTO,
} from "@/app/daily/questions/[questionId]/others/_types/types";

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

export const mockOthersSubmissionDetail: OthersSubmissionDTO = {
  nickname: "김철수",
  question: {
    id: 1,
    title: "TCP와 UDP의 차이점을 설명하세요",
    content:
      "TCP와 UDP의 주요 차이점에 대해 연결 방식, 신뢰성, 속도 측면에서 설명해주세요.",
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
  submission: {
    id: 101,
    questionId: 1,
    submittedAt: "2025-01-15T10:30:00Z",
    audioAssetId: 1001,
    evaluationStatus: "completed",
    sttStatus: "completed",
    inputType: "voice",
    answerContent:
      "TCP는 연결 지향 프로토콜로, 3-way handshake를 통해 연결을 설정합니다. 데이터 전송의 신뢰성을 보장하며, 순서대로 데이터를 전달합니다. 반면 UDP는 비연결 지향 프로토콜로, 연결 설정 없이 데이터를 전송합니다. 신뢰성은 낮지만 속도가 빠르며, 실시간 스트리밍이나 게임에 적합합니다.",
    totalScore: 95,
    duration: 45,
  },
  keywords: ["TCP", "UDP", "3-way handshake", "연결 지향", "비연결 지향"],
};

export const mockOthersSubmissionDetailNoAnswer: OthersSubmissionDTO = {
  nickname: "이영희",
  question: {
    id: 1,
    title: "TCP와 UDP의 차이점을 설명하세요",
    content:
      "TCP와 UDP의 주요 차이점에 대해 연결 방식, 신뢰성, 속도 측면에서 설명해주세요.",
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
  submission: {
    id: 102,
    questionId: 1,
    submittedAt: "2025-01-14T14:20:00Z",
    audioAssetId: 1002,
    evaluationStatus: "completed",
    sttStatus: "failed",
    inputType: "voice",
    answerContent: "",
    totalScore: 88,
    duration: 30,
  },
  keywords: [],
};
