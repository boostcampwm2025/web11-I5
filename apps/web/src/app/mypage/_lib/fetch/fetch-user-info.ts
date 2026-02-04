import { apiGet, apiPatch } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";
import { EditUserRequestDTO, UserInfoDTO } from "../../_types/user-info-dto";

async function fetchUserInfo(): Promise<UserInfoDTO> {
  try {
    return await apiGet<UserInfoDTO>("/api/users/me");
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("사용자 정보 조회 실패", {
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

async function editUserInfo({
  nickname,
  objectKey,
}: EditUserRequestDTO): Promise<UserInfoDTO | void> {
  if (!nickname && objectKey === undefined) return;

  try {
    const body: Partial<EditUserRequestDTO> = {};
    if (nickname !== undefined) body.nickname = nickname;
    if (objectKey !== undefined) body.objectKey = objectKey;

    return await apiPatch<UserInfoDTO>("/api/users/me", body);
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("사용자 정보 수정 실패", {
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

export { editUserInfo, fetchUserInfo };
