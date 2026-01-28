import { apiPost } from "@/lib/api-client";
import { PresignedUrlDto } from "../../_types/presigned-url-dto";

async function requestPresignedUrl(
  imageType: string,
): Promise<PresignedUrlDto> {
  const allowedContentTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedContentTypes.includes(imageType))
    throw new Error("허용되지 않는 데이터타입입니다.");

  try {
    return await apiPost<PresignedUrlDto>("/api/users/presigned-url", {
      contentType: imageType,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function uploadToStorage(
  uploadUrl: string,
  imageBlob: Blob,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": imageBlob.type,
    },
    body: imageBlob,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to storage: ${response.status}`);
  }
}

export { requestPresignedUrl, uploadToStorage };
