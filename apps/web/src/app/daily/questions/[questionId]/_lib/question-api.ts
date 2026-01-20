"use server";

import { Question } from "@/app/daily/questions/_types/types";
import { apiGet } from "@/lib/api-client";

export async function getQuestion(
  questionId: string,
): Promise<Question | null> {
  try {
    return await apiGet<Question>(`/questions/${questionId}`);
  } catch (error) {
    console.error("Error fetching question:", error);
    return null;
  }
}
