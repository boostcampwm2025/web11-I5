"use server";

import { Question } from "@/app/daily/questions/_types/types";
import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { redirect } from "next/navigation";

export async function getQuestion(
  questionId: string,
): Promise<Question | null> {
  let caughtError: unknown = null;

  try {
    return await apiGet<Question>(`/questions/${questionId}`);
  } catch (error) {
    caughtError = error;
  }

  if (caughtError instanceof ApiError && caughtError.status === 401) {
    redirect("/signin");
  }

  if (caughtError) {
    console.error("Error fetching question:", caughtError);
  }

  return null;
}
