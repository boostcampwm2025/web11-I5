"use server";

import { SubmissionDTO } from "../../_types/submission-dto";
import { apiGet } from "@/lib/api-client";

async function fetchSubmissionsByQuestionId(
  questionId: number,
): Promise<SubmissionDTO[]> {
  try {
    return await apiGet<SubmissionDTO[]>(
      `/answer-submissions?questionId=${questionId}`,
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { fetchSubmissionsByQuestionId };
