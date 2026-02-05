import { http, HttpResponse } from "msw";
import { mockQuestions } from "../data/questions";
import {
  mockQuestionDetail,
  mockQuestionDetailWithScore,
} from "../data/question-detail";

import {
  mockOthersSubmissions,
  mockOthersSubmissionsEmpty,
  mockOthersSubmissionDetail,
  mockOthersSubmissionDetailNoAnswer,
} from "../data/others-submissions";
import { mockReportQuestion } from "../data/reports";

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

  // 인증된 사용자 문제 목록
  http.get(`${API_URL}/questions/auth`, () => {
    return HttpResponse.json(mockQuestions);
  }),

  // 다른 사람 제출 상세 (더 구체적인 경로가 먼저 와야 함)
  http.get(
    `${API_URL}/questions/:questionId/others/:submissionId`,
    ({ params }) => {
      const { submissionId } = params;

      // submissionId가 102인 경우 답변 없는 데이터 반환
      if (submissionId === "102") {
        return HttpResponse.json(mockOthersSubmissionDetailNoAnswer);
      }

      // 기본적으로 답변이 있는 데이터 반환
      return HttpResponse.json(mockOthersSubmissionDetail);
    },
  ),

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
