import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";

/**
 * POST /api/uploads/complete
 * 업로드 완료를 확인하는 BFF 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await apiClient("/uploads/complete", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("업로드 완료 확인 실패", { responseBody: errorText });
      return NextResponse.json(
        { error: "Failed to confirm upload" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error("uploads/complete 처리 오류", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
