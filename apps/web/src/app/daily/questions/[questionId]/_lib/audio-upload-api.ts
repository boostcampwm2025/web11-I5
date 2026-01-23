interface RequestPresignedUrlParams {
  codec: string;
  sampleRate: number;
  channels: number;
  estimatedSize?: number;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  objectKey: string;
  assetId: number;
  expiresIn: number;
}

interface ConfirmUploadParams {
  assetId: number;
  byteSize: number;
  durationMs?: number;
}

interface ConfirmUploadResponse {
  assetId: number;
  storageUrl: string;
  uploadStatus: string;
}

/**
 * Presigned URL 요청
 */
export async function requestPresignedUrl(
  params: RequestPresignedUrlParams,
): Promise<PresignedUrlResponse> {
  const response = await fetch("/api/uploads/presigned-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get presigned URL: ${errorText}`);
  }

  return response.json();
}

/**
 * Object Storage에 직접 PUT 업로드
 */
export async function uploadToStorage(
  uploadUrl: string,
  audioBlob: Blob,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": audioBlob.type || "audio/wav",
    },
    body: audioBlob,
  });

  // S3 PUT은 200 또는 204를 반환
  if (!response.ok) {
    throw new Error(`Failed to upload to storage: ${response.status}`);
  }
}

/**
 * 업로드 완료 확인
 */
export async function confirmUpload(
  params: ConfirmUploadParams,
): Promise<ConfirmUploadResponse> {
  const response = await fetch("/api/uploads/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to confirm upload: ${errorText}`);
  }

  return response.json();
}
