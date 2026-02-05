import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";
import {
  StreakCountDto,
  StreaksDTO,
  StreakSequenceDto,
} from "../../_types/streak";

async function fetchStreaks(): Promise<StreaksDTO> {
  try {
    const [streakCount, sequencyDailyCount] = await Promise.all([
      apiGet<StreakCountDto>("/streaks"),
      apiGet<StreakSequenceDto>("/streaks/consecutive"),
    ]);
    return { ...streakCount, ...sequencyDailyCount };
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("스트릭 조회 실패", {
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}
export { fetchStreaks };
