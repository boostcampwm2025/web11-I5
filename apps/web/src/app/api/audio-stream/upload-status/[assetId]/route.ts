import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/audio-stream/upload-status/:assetId
 * 오디오 파일 업로드 상태를 조회하는 BFF 엔드포인트
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;

  try {
    const apiUrl = process.env.API_URL || "http://localhost:3000";
    const response = await fetch(
      `${apiUrl}/audio-stream/upload-status/${assetId}`,
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get upload status" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/audio-stream/upload-status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
