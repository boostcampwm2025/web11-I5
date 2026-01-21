import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";

/**
 * POST /api/audio-stream/finalize
 * 오디오 스트리밍 세션을 종료하는 BFF 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    // NestJS API 호출 (Bearer 토큰 자동 포함)
    const response = await apiClient("/audio-stream/finalize", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to finalize session:", errorText);
      return NextResponse.json(
        { error: "Failed to finalize audio session" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /audio-stream/finalize:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
