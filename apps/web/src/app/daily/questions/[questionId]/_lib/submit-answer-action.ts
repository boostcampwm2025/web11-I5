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

  try {
    const data = await apiPost<{ id: number }>("/api/answer-submissions", {
      audioAssetId: Number(audioAssetId),
      questionId: Number(questionId),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to submit answer:", errorText);
      return {
        success: false,
        message: "",
        error: "답변 제출에 실패했습니다.",
      };
    }

    const data = await response.json();
    const submissionId = data.id;

    return {
      success: true,
      submissionId: submissionId,
      message: "제출 성공",
    };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      message: "",
      error: "답변 제출 중 오류가 발생했습니다.",
    };
  }
}
