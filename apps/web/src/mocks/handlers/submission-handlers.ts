import { http, HttpResponse } from "msw";
import { mockSubmissions } from "../data/reports";

const API_URL = process.env.API_URL || "http://localhost:8000";

export const submissionHandlers = [
  // 제출 목록 조회
  http.get(`${API_URL}/answer-submissions`, ({ request }) => {
    const url = new URL(request.url);
    const questionId = url.searchParams.get("questionId");

    if (!questionId) {
      return HttpResponse.json(
        { message: "questionId is required" },
        { status: 400 },
      );
    }

    // questionId로 필터링 후 날짜순 정렬 (오래된 것 -> 최신 순)
    const submissions = mockSubmissions
      .filter((s) => s.questionId === Number(questionId))
      .sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
      );

    return HttpResponse.json(submissions);
  }),

  // 단일 제출 조회
  http.get(`${API_URL}/answer-submissions/:id`, ({ params }) => {
    const { id } = params;
    const submission = mockSubmissions.find((s) => s.id === Number(id));

    if (!submission) {
      return HttpResponse.json(
        { message: "Submission not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(submission);
  }),
];
