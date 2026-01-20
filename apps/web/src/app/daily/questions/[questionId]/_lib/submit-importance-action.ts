"use server";

export interface ActionState {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function updateImportanceAction(
  prevState: ActionState | null,
  data: { questionId: number; score: number },
): Promise<ActionState> {
  try {
    const response = await fetch(`${API_URL}/answer-submissions/importance`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: data.questionId,
        selfImportanceRating: data.score,
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
    console.error("Server Action Error:", error);
    return {
      success: false,
      message: "네트워크 오류가 발생했습니다.",
    };
  }
}
