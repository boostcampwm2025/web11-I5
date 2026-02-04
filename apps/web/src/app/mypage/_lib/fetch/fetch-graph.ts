import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";
import { GraphData } from "../../_types/graph-view";

async function fetchGraph(): Promise<GraphData> {
  try {
    return await apiGet<GraphData>("/graph");
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("그래프 데이터 조회 실패", {
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

export { fetchGraph };
