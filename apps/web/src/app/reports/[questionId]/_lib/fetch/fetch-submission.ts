"use server";

import { SubmissionDTO } from "../../_types/submission-dto";
import { apiGet } from "@/lib/api-client";

async function fetchSubmissionById(
  submissionId: number,
): Promise<SubmissionDTO | null> {
  try {
    return await apiGet<SubmissionDTO>(`/answer-submissions/${submissionId}`);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export { fetchSubmissionById };
