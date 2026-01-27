export interface PresignedUrlDto {
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
}
