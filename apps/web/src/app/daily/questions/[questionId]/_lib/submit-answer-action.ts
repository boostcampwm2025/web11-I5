"use server";

import { redirect } from "next/navigation";
import { apiPost } from "@/lib/api-client";

export interface SubmitAnswerState {
  success: boolean;
  message: string;
  submissionId?: number;
  error?: string;
}

export async function submitAnswerAction(
  prevState: SubmitAnswerState | null,
  formData: FormData,
): Promise<SubmitAnswerState> {
  const audioAssetId = formData.get("audioAssetId");
  const questionId = formData.get("questionId");

  if (!audioAssetId || !questionId) {
    return {
      success: false,
      message: "",
      error: "필수 정보가 누락되었습니다.",
    };
  }

  let response: { id: number } | undefined;

  try {
    response = await apiPost<{ id: number }>("/answer-submissions", {
      audioAssetId: Number(audioAssetId),
      questionId: Number(questionId),
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      message: "",
      error: "답변 제출 중 오류가 발생했습니다.",
    };
  }

  if (response) {
    redirect(`/reports/${questionId}?attempt=${response.id}`);
  }

  return {
    success: true,
    message: "",
  };
}
