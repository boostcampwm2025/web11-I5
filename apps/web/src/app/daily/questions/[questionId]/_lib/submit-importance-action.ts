"use server";

import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";

export interface ActionState {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export async function updateImportanceAction(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const questionId = formData.get("questionId");
  const score = formData.get("score");

  if (!questionId || !score) {
    return {
      success: false,
      message: "필수 입력값이 누락되었습니다.",
    };
  }

  try {
    const response = await apiClient("/answer-submissions/importance", {
      method: "PATCH",
      body: JSON.stringify({
        questionId: Number(questionId),
        selfImportanceRating: Number(score),
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "중요도 업데이트에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    return {
      success: true,
      message: "평가가 성공적으로 기록되었습니다.",
    };
  } catch (error) {
    logger.error("중요도 평가 액션 오류", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      message: "네트워크 오류가 발생했습니다.",
    };
  }
}
