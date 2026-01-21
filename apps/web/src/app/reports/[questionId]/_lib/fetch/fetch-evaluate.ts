"use server";

import { apiPost } from "@/lib/api-client";

async function reEvaluate(submissionId: number): Promise<boolean> {
  try {
    await apiPost("/answer-evaluation", {
      submissionId,
    });
    return true;
  } catch (error) {
    console.error("재채점 요청 실패: ", error);
    return false;
  }
}

export { reEvaluate };
