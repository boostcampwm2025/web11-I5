import { apiGet } from "@/lib/api-client";
import { UserInfoDTO } from "../../_types/user-info-dto";

async function fetchUserInfo(): Promise<UserInfoDTO> {
  try {
    return await apiGet<UserInfoDTO>("/api/users/me");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { fetchUserInfo };
