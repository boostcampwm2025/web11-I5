"use server";

import { apiPost } from "@/lib/api-client";

interface SubmitAnswerState {
  success: boolean;
  message: string;
  submissionId?: number;
  error?: string;
}

interface SubmitAnswerParams {
  questionId: number;
  audioAssetId?: number;
  rawAnswer?: string;
}

async function submitAnswerAction({
  audioAssetId,
  questionId,
  rawAnswer,
}: SubmitAnswerParams): Promise<SubmitAnswerState> {
  if (!questionId || !(audioAssetId || rawAnswer)) {
    return {
      success: false,
      message: "",
      error: "필수 정보가 누락되었습니다.",
    };
  }

  try {
    const data = await apiPost<{ id: number }>("/answer-submissions", {
      audioAssetId: audioAssetId,
      questionId: Number(questionId),
      rawAnswer,
    });

    return {
      success: true,
      message: "답변이 성공적으로 제출되었습니다.",
      submissionId: data.id,
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

export { submitAnswerAction };
