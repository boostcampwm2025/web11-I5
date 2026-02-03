import { http, HttpResponse } from "msw";
import { mockQuestions } from "../data/questions";
import {
  mockOthersSubmissions,
  mockOthersSubmissionsEmpty,
} from "../data/others-submissions";

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

  // 다른 사람들의 제출 목록
  http.get(`${API_URL}/questions/:questionId/others`, ({ params }) => {
    const { questionId } = params;

    // questionId가 2인 경우 빈 제출 목록 반환
    if (questionId === "2") {
      return HttpResponse.json(mockOthersSubmissionsEmpty);
    }

    // 기본적으로 제출 목록이 있는 데이터 반환
    return HttpResponse.json(mockOthersSubmissions);
  }),
];
