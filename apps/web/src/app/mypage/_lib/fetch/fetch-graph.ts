import { apiGet } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";
import { GraphData } from "../../_types/graph-view";

async function fetchGraph(): Promise<GraphData> {
  try {
    return await apiGet<GraphData>("/graph");
  } catch (error) {
    logger.error("그래프 데이터 조회 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export { fetchGraph };
