import { apiGet, apiPatch } from "@/lib/api-client";
import { EditUserRequestDTO, UserInfoDTO } from "../../_types/user-info-dto";

async function fetchUserInfo(): Promise<UserInfoDTO> {
  try {
    return await apiGet<UserInfoDTO>("/api/users/me");
  } catch (error) {
    console.error(error);
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
    console.error(error);
    throw error;
  }
}

export { editUserInfo, fetchUserInfo };
