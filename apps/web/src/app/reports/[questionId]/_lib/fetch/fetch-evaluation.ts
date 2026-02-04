"use server";

import { EvaluationDTO } from "../../_types/evaluation-dto";
import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";

async function fetchEvaluation(
  submissionId: number,
): Promise<EvaluationDTO | null> {
  try {
    return await apiGet<EvaluationDTO>(`/answer-evaluation/${submissionId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("평가 결과 조회 실패", {
        submissionId,
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    return null; // mapToReportDetail이 null을 처리함
  }
}

export { fetchEvaluation };
