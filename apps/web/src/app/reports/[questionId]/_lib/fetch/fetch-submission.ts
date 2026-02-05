"use server";

import { SubmissionDTO } from "../../_types/submission-dto";
import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";

async function fetchSubmissionById(
  submissionId: number,
): Promise<SubmissionDTO | null> {
  try {
    return await apiGet<SubmissionDTO>(`/answer-submissions/${submissionId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("제출 단건 조회 실패", {
        submissionId,
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    return null;
  }
}

export { fetchSubmissionById };
