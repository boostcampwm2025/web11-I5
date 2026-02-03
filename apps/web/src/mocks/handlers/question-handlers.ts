import { http, HttpResponse } from "msw";
import { mockQuestions } from "../data/questions";
import { mockReportQuestion } from "../data/reports";

const API_URL = process.env.API_URL || "http://localhost:8000";

export const questionHandlers = [
  // 문제 목록
  http.get(`${API_URL}/questions`, () => {
    return HttpResponse.json(mockQuestions);
  }),

  // 인증된 사용자 문제 목록
  http.get(`${API_URL}/questions/auth`, () => {
    return HttpResponse.json(mockQuestions);
  }),

  // 단일 문제 조회
  http.get(`${API_URL}/questions/:id`, ({ params }) => {
    const { id } = params;

    // 리포트 페이지용 mock 데이터
    if (Number(id) === 1) {
      return HttpResponse.json(mockReportQuestion);
    }

    // 기본 mock 문제 목록에서 검색
    const question = mockQuestions.questions.find((q) => q.id === Number(id));

    if (!question) {
      return HttpResponse.json(
        { message: "Question not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(question);
  }),
];
