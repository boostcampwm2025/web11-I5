export interface UserInfoDTO {
  id: number;
  nickname: string;
  role: string;
  totalPoint: number;
  totalScore: number;
  createdAt: string;
  email?: string;
}
