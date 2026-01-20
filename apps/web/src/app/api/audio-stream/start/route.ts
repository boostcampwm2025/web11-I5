import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";

/**
 * POST /api/audio-stream/start
 * 오디오 스트리밍 세션을 시작하는 BFF 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codec, sampleRate, channels } = body;

    // NestJS API 호출 (Bearer 토큰 자동 포함)
    const response = await apiClient("/api/audio-stream/start", {
      method: "POST",
      body: JSON.stringify({
        codec,
        sampleRate,
        channels,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to start session:", errorText);
      return NextResponse.json(
        { error: "Failed to start audio session" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/audio-stream/start:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
