"use server";

import { EvaluationDTO } from "../../_types/evaluation-dto";
import { apiGet } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";

async function fetchEvaluation(
  submissionId: number,
): Promise<EvaluationDTO | null> {
  try {
    return await apiGet<EvaluationDTO>(`/answer-evaluation/${submissionId}`);
  } catch (error) {
    logger.error("평가 결과 조회 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null; // mapToReportDetail이 null을 처리함
  }
}

export { fetchEvaluation };
