"use server";

import { SubmissionDTO } from "../../_types/submission-dto";
import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";

async function fetchSubmissionsByQuestionId(
  questionId: number,
): Promise<SubmissionDTO[]> {
  try {
    return await apiGet<SubmissionDTO[]>(
      `/answer-submissions?questionId=${questionId}`,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("제출 목록 조회 실패", {
        questionId,
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

export { fetchSubmissionsByQuestionId };
