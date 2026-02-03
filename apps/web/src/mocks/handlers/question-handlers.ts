import { http, HttpResponse } from "msw";
import { mockQuestions } from "../data/questions";
import {
  mockQuestionDetail,
  mockQuestionDetailWithScore,
} from "../data/question-detail";

const API_URL = process.env.API_URL || "http://localhost:8000";

export const questionHandlers = [
  // 인증된 사용자 문제 목록 (구체적인 경로를 먼저 배치)
  http.get(`${API_URL}/questions/auth`, () => {
    return HttpResponse.json(mockQuestions);
  }),

  // 문제 상세
  http.get(`${API_URL}/questions/:questionId`, ({ params }) => {
    const { questionId } = params;
    const id = Number(questionId);

    if (id === 1) {
      return HttpResponse.json(mockQuestionDetail);
    }
    if (id === 2) {
      return HttpResponse.json(mockQuestionDetailWithScore);
    }
    // 존재하지 않는 문제
    return new HttpResponse(null, { status: 404 });
  }),

  // 문제 목록
  http.get(`${API_URL}/questions`, () => {
    return HttpResponse.json(mockQuestions);
  }),
];
