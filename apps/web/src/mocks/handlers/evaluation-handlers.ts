import { http, HttpResponse } from "msw";
import { mockEvaluations } from "../data/reports";

const API_URL = process.env.API_URL || "http://localhost:8000";

export const evaluationHandlers = [
  // 평가 결과 조회
  http.get(`${API_URL}/answer-evaluation/:submissionId`, ({ params }) => {
    const { submissionId } = params;
    const evaluation = mockEvaluations[Number(submissionId)];

    if (!evaluation) {
      return HttpResponse.json(
        { message: "Evaluation not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(evaluation);
  }),

  // 재평가 요청
  http.post(`${API_URL}/answer-evaluation`, async ({ request }) => {
    const body = (await request.json()) as { submissionId: number };

    if (!body.submissionId) {
      return HttpResponse.json(
        { message: "submissionId is required" },
        { status: 400 },
      );
    }

    // 재평가 요청 성공 응답
    return HttpResponse.json(
      {
        message: "Re-evaluation started",
        submissionId: body.submissionId,
      },
      { status: 200 },
    );
  }),
];
