import { GraphData, NodeType } from "../_types/graph-view";

export const mockGraphData: GraphData = {
  nodes: [
    // React 기초 (1-10)
    {
      id: 1,
      type: NodeType.QUESTION,
      label: "React란 무엇인가요?",
      questionId: 1,
    },
    { id: 2, type: NodeType.KEYWORD, label: "React", questionId: null },
    { id: 3, type: NodeType.KEYWORD, label: "Virtual DOM", questionId: null },
    {
      id: 4,
      type: NodeType.QUESTION,
      label: "Virtual DOM의 동작 원리는?",
      questionId: 4,
    },
    { id: 5, type: NodeType.KEYWORD, label: "컴포넌트", questionId: null },
    {
      id: 6,
      type: NodeType.QUESTION,
      label: "useState와 useEffect 차이점은?",
      questionId: 6,
    },
    { id: 7, type: NodeType.KEYWORD, label: "Hook", questionId: null },
    { id: 8, type: NodeType.KEYWORD, label: "State", questionId: null },
    { id: 9, type: NodeType.KEYWORD, label: "Props", questionId: null },
    {
      id: 10,
      type: NodeType.QUESTION,
      label: "State와 Props의 차이는?",
      questionId: 10,
    },

    // JavaScript 기초 (11-20)
    { id: 11, type: NodeType.KEYWORD, label: "JavaScript", questionId: null },
    {
      id: 12,
      type: NodeType.QUESTION,
      label: "클로저란 무엇인가요?",
      questionId: 12,
    },
    { id: 13, type: NodeType.KEYWORD, label: "클로저", questionId: null },
    { id: 14, type: NodeType.KEYWORD, label: "스코프", questionId: null },
    {
      id: 15,
      type: NodeType.QUESTION,
      label: "호이스팅이란?",
      questionId: 15,
    },
    { id: 16, type: NodeType.KEYWORD, label: "호이스팅", questionId: null },
    { id: 17, type: NodeType.KEYWORD, label: "Promise", questionId: null },
    {
      id: 18,
      type: NodeType.QUESTION,
      label: "Promise와 async/await 차이는?",
      questionId: 18,
    },
    { id: 19, type: NodeType.KEYWORD, label: "async/await", questionId: null },
    { id: 20, type: NodeType.KEYWORD, label: "이벤트 루프", questionId: null },

    // TypeScript (21-27)
    { id: 21, type: NodeType.KEYWORD, label: "TypeScript", questionId: null },
    {
      id: 22,
      type: NodeType.QUESTION,
      label: "TypeScript를 사용하는 이유는?",
      questionId: 22,
    },
    { id: 23, type: NodeType.KEYWORD, label: "제네릭", questionId: null },
    {
      id: 24,
      type: NodeType.QUESTION,
      label: "제네릭은 언제 사용하나요?",
      questionId: 24,
    },
    { id: 25, type: NodeType.KEYWORD, label: "인터페이스", questionId: null },
    {
      id: 26,
      type: NodeType.QUESTION,
      label: "interface vs type 차이는?",
      questionId: 26,
    },
    { id: 27, type: NodeType.KEYWORD, label: "타입 추론", questionId: null },

    // Next.js (28-35)
    { id: 28, type: NodeType.KEYWORD, label: "Next.js", questionId: null },
    {
      id: 29,
      type: NodeType.QUESTION,
      label: "Next.js의 장점은?",
      questionId: 29,
    },
    { id: 30, type: NodeType.KEYWORD, label: "SSR", questionId: null },
    { id: 31, type: NodeType.KEYWORD, label: "SSG", questionId: null },
    {
      id: 32,
      type: NodeType.QUESTION,
      label: "SSR과 SSG 차이는?",
      questionId: 32,
    },
    { id: 33, type: NodeType.KEYWORD, label: "App Router", questionId: null },
    {
      id: 34,
      type: NodeType.KEYWORD,
      label: "Server Components",
      questionId: null,
    },
    {
      id: 35,
      type: NodeType.QUESTION,
      label: "Server Components란?",
      questionId: 35,
    },

    // CSS/스타일링 (36-42)
    { id: 36, type: NodeType.KEYWORD, label: "CSS", questionId: null },
    { id: 37, type: NodeType.KEYWORD, label: "Flexbox", questionId: null },
    {
      id: 38,
      type: NodeType.QUESTION,
      label: "Flexbox 사용법은?",
      questionId: 38,
    },
    { id: 39, type: NodeType.KEYWORD, label: "Grid", questionId: null },
    { id: 40, type: NodeType.KEYWORD, label: "반응형", questionId: null },
    { id: 41, type: NodeType.KEYWORD, label: "Tailwind CSS", questionId: null },
    {
      id: 42,
      type: NodeType.QUESTION,
      label: "반응형 디자인 구현 방법은?",
      questionId: 42,
    },

    // 상태관리/API (43-50)
    { id: 43, type: NodeType.KEYWORD, label: "Redux", questionId: null },
    {
      id: 44,
      type: NodeType.QUESTION,
      label: "Redux 동작 원리는?",
      questionId: 44,
    },
    { id: 45, type: NodeType.KEYWORD, label: "전역 상태", questionId: null },
    { id: 46, type: NodeType.KEYWORD, label: "REST API", questionId: null },
    { id: 47, type: NodeType.KEYWORD, label: "GraphQL", questionId: null },
    {
      id: 48,
      type: NodeType.QUESTION,
      label: "REST vs GraphQL 차이는?",
      questionId: 48,
    },
    { id: 49, type: NodeType.KEYWORD, label: "React Query", questionId: null },
    {
      id: 50,
      type: NodeType.QUESTION,
      label: "React Query 사용 이유는?",
      questionId: 50,
    },
  ],
  edges: [
    // React 기초 연결
    { id: 1, sourceId: 1, targetId: 2 },
    { id: 2, sourceId: 1, targetId: 3 },
    { id: 3, sourceId: 4, targetId: 3 },
    { id: 4, sourceId: 4, targetId: 2 },
    { id: 5, sourceId: 1, targetId: 5 },
    { id: 6, sourceId: 6, targetId: 7 },
    { id: 7, sourceId: 6, targetId: 8 },
    { id: 8, sourceId: 10, targetId: 8 },
    { id: 9, sourceId: 10, targetId: 9 },
    { id: 10, sourceId: 7, targetId: 8 },

    // JavaScript 연결
    { id: 11, sourceId: 12, targetId: 13 },
    { id: 12, sourceId: 12, targetId: 14 },
    { id: 13, sourceId: 15, targetId: 16 },
    { id: 14, sourceId: 15, targetId: 14 },
    { id: 15, sourceId: 18, targetId: 17 },
    { id: 16, sourceId: 18, targetId: 19 },
    { id: 17, sourceId: 18, targetId: 20 },
    { id: 18, sourceId: 17, targetId: 20 },
    { id: 19, sourceId: 2, targetId: 11 },

    // TypeScript 연결
    { id: 20, sourceId: 22, targetId: 21 },
    { id: 21, sourceId: 22, targetId: 27 },
    { id: 22, sourceId: 24, targetId: 23 },
    { id: 23, sourceId: 24, targetId: 21 },
    { id: 24, sourceId: 26, targetId: 25 },
    { id: 25, sourceId: 26, targetId: 21 },
    { id: 26, sourceId: 21, targetId: 11 },

    // Next.js 연결
    { id: 27, sourceId: 29, targetId: 28 },
    { id: 28, sourceId: 29, targetId: 30 },
    { id: 29, sourceId: 29, targetId: 31 },
    { id: 30, sourceId: 32, targetId: 30 },
    { id: 31, sourceId: 32, targetId: 31 },
    { id: 32, sourceId: 35, targetId: 34 },
    { id: 33, sourceId: 35, targetId: 33 },
    { id: 34, sourceId: 28, targetId: 2 },
    { id: 35, sourceId: 34, targetId: 5 },

    // CSS 연결
    { id: 36, sourceId: 38, targetId: 37 },
    { id: 37, sourceId: 38, targetId: 36 },
    { id: 38, sourceId: 42, targetId: 40 },
    { id: 39, sourceId: 42, targetId: 36 },
    { id: 40, sourceId: 37, targetId: 39 },
    { id: 41, sourceId: 41, targetId: 36 },

    // 상태관리/API 연결
    { id: 42, sourceId: 44, targetId: 43 },
    { id: 43, sourceId: 44, targetId: 8 },
    { id: 44, sourceId: 44, targetId: 45 },
    { id: 45, sourceId: 48, targetId: 46 },
    { id: 46, sourceId: 48, targetId: 47 },
    { id: 47, sourceId: 50, targetId: 49 },
    { id: 48, sourceId: 50, targetId: 8 },
    { id: 49, sourceId: 49, targetId: 17 },

    // 크로스 도메인 연결
    { id: 50, sourceId: 43, targetId: 45 },
    { id: 51, sourceId: 7, targetId: 2 },
    { id: 52, sourceId: 5, targetId: 9 },
    { id: 53, sourceId: 21, targetId: 2 },
    { id: 54, sourceId: 28, targetId: 30 },
    { id: 55, sourceId: 41, targetId: 40 },
  ],
};
