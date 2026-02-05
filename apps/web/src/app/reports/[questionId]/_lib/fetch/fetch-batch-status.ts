"use server";

import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";

export interface ProcessingStatus {
  status: "PROCESSING" | "FAILED" | "COMPLETED";
  step?: "STT" | "EVALUATION";
  message?: string;
}

async function fetchBatchReportProcessingStatus(
  submissionIds: number[],
): Promise<Record<number, ProcessingStatus>> {
  if (submissionIds.length === 0) {
    return {};
  }

  try {
    const ids = submissionIds.join(",");
    return await apiGet<Record<number, ProcessingStatus>>(
      `/answer-submissions/batch-status?ids=${ids}`,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("배치 상태 조회 실패", {
        submissionIds,
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

export { fetchBatchReportProcessingStatus };
