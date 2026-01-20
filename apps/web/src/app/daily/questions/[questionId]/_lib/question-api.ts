"use server";

import { Question } from "@/app/daily/questions/_types/types";
import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { redirect } from "next/navigation";

export async function getQuestion(
  questionId: string,
): Promise<Question | null> {
  try {
    return await apiGet<Question>(`/questions/${questionId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/signin");
      return null;
    }
    console.error("Error fetching question:", error);
    return null;
  }
}
