"use server";

import { SubmissionDTO } from "../../_types/submission-dto";
import { apiGet } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";

async function fetchSubmissionById(
  submissionId: number,
): Promise<SubmissionDTO | null> {
  try {
    return await apiGet<SubmissionDTO>(`/answer-submissions/${submissionId}`);
  } catch (error) {
    logger.error("제출 단건 조회 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export { fetchSubmissionById };
