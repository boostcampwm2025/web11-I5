/**
 * 오디오 스트리밍 세션 API 클라이언트
 */

interface StartSessionParams {
  codec: string;
  sampleRate: number;
  channels: number;
}

interface StartSessionResponse {
  sessionId: string;
}

interface FinalizeSessionParams {
  sessionId: string;
  lastSeq?: number;
}

interface FinalizeSessionResponse {
  filePath: string;
  fileName: string;
  assetId: number;
}

/**
 * 오디오 스트리밍 세션 시작
 */
export async function startAudioSession(
  params: StartSessionParams,
): Promise<StartSessionResponse> {
  const response = await fetch("/api/audio-stream/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to start session: ${errorText}`);
  }

  return response.json();
}

/**
 * 오디오 스트리밍 세션 종료
 */
export async function finalizeAudioSession(
  params: FinalizeSessionParams,
): Promise<FinalizeSessionResponse> {
  const response = await fetch("/api/audio-stream/finalize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to finalize session: ${errorText}`);
  }

  return response.json();
}
