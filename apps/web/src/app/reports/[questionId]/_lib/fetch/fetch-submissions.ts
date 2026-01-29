"use server";

import { SubmissionDTO } from "../../_types/submission-dto";
import { apiGet } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";

async function fetchSubmissionsByQuestionId(
  questionId: number,
): Promise<SubmissionDTO[]> {
  try {
    return await apiGet<SubmissionDTO[]>(
      `/answer-submissions?questionId=${questionId}`,
    );
  } catch (error) {
    logger.error("제출 목록 조회 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export { fetchSubmissionsByQuestionId };
