export interface UserInfoDTO {
  id: number;
  nickname: string;
  email: string;
  role: string;
  totalPoint: number;
  totalScore: number;
  createdAt: string;
  profileImage: string | null;
}

export interface EditUserRequestDTO {
  nickname?: string;
  objectKey?: string | null;
}
