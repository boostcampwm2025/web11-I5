import { http, HttpResponse } from "msw";

const API_URL = process.env.API_URL || "http://localhost:8000";

const mockCategories = [
  { id: 1, name: "네트워크", depth: 0, parentId: null },
  { id: 2, name: "운영체제", depth: 0, parentId: null },
  { id: 3, name: "데이터베이스", depth: 0, parentId: null },
];

const mockCategoryTrees: Record<number, object> = {
  1: {
    id: 1,
    name: "네트워크",
    depth: 0,
    parentId: null,
    children: [
      { id: 11, name: "TCP/IP", depth: 1, parentId: 1 },
      { id: 12, name: "HTTP", depth: 1, parentId: 1 },
    ],
  },
  2: {
    id: 2,
    name: "운영체제",
    depth: 0,
    parentId: null,
    children: [
      { id: 21, name: "프로세스", depth: 1, parentId: 2 },
      { id: 22, name: "메모리", depth: 1, parentId: 2 },
    ],
  },
  3: {
    id: 3,
    name: "데이터베이스",
    depth: 0,
    parentId: null,
    children: [
      { id: 31, name: "SQL", depth: 1, parentId: 3 },
      { id: 32, name: "인덱스", depth: 1, parentId: 3 },
    ],
  },
};

const mockQuestions = {
  questions: [
    {
      id: 1,
      title: "TCP와 UDP의 차이점을 설명하세요",
      content: "",
      ttsUrl: null,
      avgScore: 85,
      avgImportance: 4.5,
      categoryId: 11,
      category: { id: 11, name: "TCP/IP", depth: 1, parentId: 1 },
      score: null,
    },
    {
      id: 2,
      title: "HTTP와 HTTPS의 차이점은 무엇인가요?",
      content: "",
      ttsUrl: null,
      avgScore: 78,
      avgImportance: 4.0,
      categoryId: 12,
      category: { id: 12, name: "HTTP", depth: 1, parentId: 1 },
      score: 90,
    },
    {
      id: 3,
      title: "프로세스와 스레드의 차이를 설명하세요",
      content: "",
      ttsUrl: null,
      avgScore: 82,
      avgImportance: 4.8,
      categoryId: 21,
      category: { id: 21, name: "프로세스", depth: 1, parentId: 2 },
      score: null,
    },
  ],
  totalCount: 3,
  pageSize: 10,
  currentPage: 1,
  totalPages: 1,
};

export const handlers = [
  // 카테고리 루트 목록
  http.get(`${API_URL}/categories/roots`, () => {
    return HttpResponse.json(mockCategories);
  }),

  // 카테고리 트리
  http.get(`${API_URL}/categories/tree-by-id/:categoryId`, ({ params }) => {
    const categoryId = Number(params.categoryId);
    const tree = mockCategoryTrees[categoryId];
    if (tree) {
      return HttpResponse.json(tree);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // 문제 목록
  http.get(`${API_URL}/questions`, () => {
    return HttpResponse.json(mockQuestions);
  }),

  // 인증된 사용자 문제 목록
  http.get(`${API_URL}/questions/auth`, () => {
    return HttpResponse.json(mockQuestions);
  }),
];
