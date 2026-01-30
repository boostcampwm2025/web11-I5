import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";

/**
 * POST /api/uploads/presigned-url
 * Presigned PUT URL을 발급하는 BFF 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await apiClient("/uploads/presigned-url", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Presigned URL 발급 실패", { responseBody: errorText });
      return NextResponse.json(
        { error: "Failed to get presigned URL" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error("uploads/presigned-url 처리 오류", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
