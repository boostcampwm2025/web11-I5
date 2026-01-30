"use server";

import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";
import { revalidatePath } from "next/cache";
import { editUserInfo } from "../fetch/fetch-user-info";

export interface EditUserActionState {
  success: boolean;
  message: string;
  errors?: {
    nickname?: string[];
    profileImage?: string[];
  };
}

const VALIDATION = {
  NICKNAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
  },
} as const;

async function editUserAction(
  _prevState: EditUserActionState | null,
  formData: FormData,
): Promise<EditUserActionState> {
  try {
    const nickname = formData.get("nickname");
    const removeImage = formData.get("removeImage");
    const objectKeyFromClient = formData.get("objectKey");

    const nicknameValue =
      nickname && typeof nickname === "string" ? nickname.trim() : undefined;
    const shouldRemoveImage = removeImage === "true";
    const newObjectKey =
      objectKeyFromClient && typeof objectKeyFromClient === "string"
        ? objectKeyFromClient
        : undefined;

    if (!nicknameValue && !newObjectKey && !shouldRemoveImage) {
      return {
        success: false,
        message: "변경할 정보를 입력해주세요.",
      };
    }

    if (nicknameValue) {
      if (
        nicknameValue.length < VALIDATION.NICKNAME.MIN_LENGTH ||
        nicknameValue.length > VALIDATION.NICKNAME.MAX_LENGTH
      ) {
        return {
          success: false,
          message: "입력값을 확인해주세요.",
          errors: {
            nickname: [
              `닉네임은 ${VALIDATION.NICKNAME.MIN_LENGTH}-${VALIDATION.NICKNAME.MAX_LENGTH}자 사이여야 합니다.`,
            ],
          },
        };
      }
    }

    let objectKey: string | null | undefined;
    if (shouldRemoveImage) {
      objectKey = null;
    } else if (newObjectKey) {
      objectKey = newObjectKey;
    }

    await editUserInfo({
      nickname: nicknameValue,
      objectKey: objectKey,
    });
    revalidatePath("/mypage");
    return {
      success: true,
      message: shouldRemoveImage
        ? "프로필 이미지가 삭제되었습니다."
        : "프로필이 성공적으로 업데이트되었습니다.",
    };
  } catch (error) {
    logger.error("프로필 수정 액션 오류", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.getUserMessage(),
      };
    }

    return {
      success: false,
      message: "프로필 업데이트 중 오류가 발생했습니다.",
    };
  }
}

export { editUserAction };
