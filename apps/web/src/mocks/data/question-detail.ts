import { Question } from "@/app/daily/questions/_types/types";

export const mockQuestionDetail: Question = {
  id: 1,
  title: "TCP와 UDP의 차이점을 설명하세요",
  content:
    "TCP와 UDP는 전송 계층의 프로토콜입니다. 두 프로토콜의 특징과 차이점, 그리고 각각 어떤 상황에서 사용되는지 설명해주세요.",
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
};

export const mockQuestionDetailWithScore: Question = {
  id: 2,
  title: "HTTP와 HTTPS의 차이점은 무엇인가요?",
  content:
    "HTTP와 HTTPS의 차이점과 HTTPS가 보안을 제공하는 방법에 대해 설명해주세요.",
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
  score: 90,
};
