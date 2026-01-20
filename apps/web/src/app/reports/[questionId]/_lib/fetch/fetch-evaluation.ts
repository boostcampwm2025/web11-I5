"use server";

import { EvaluationDTO } from "../../_types/evaluation-dto";
import { apiGet } from "@/lib/api-client";

async function fetchEvaluation(
  submissionId: number,
): Promise<EvaluationDTO | null> {
  try {
    return await apiGet<EvaluationDTO>(
      `/api/answer-evaluation/${submissionId}`,
    );
  } catch (error) {
    console.error(error);
    return null; // mapToReportDetail이 null을 처리함
  }
}

export { fetchEvaluation };
