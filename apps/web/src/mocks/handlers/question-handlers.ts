import { http, HttpResponse } from "msw";
import { mockQuestions } from "../data/questions";

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
];
