"use server";

import { apiPost } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";

async function reEvaluate(submissionId: number): Promise<boolean> {
  try {
    await apiPost("/answer-evaluation", {
      submissionId,
    });
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("재채점 요청 실패", {
        submissionId,
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    return false;
  }
}

export { reEvaluate };
