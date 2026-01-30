"use server";

import { apiPost } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";

async function reEvaluate(submissionId: number): Promise<boolean> {
  try {
    await apiPost("/answer-evaluation", {
      submissionId,
    });
    return true;
  } catch (error) {
    logger.error("재채점 요청 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export { reEvaluate };
