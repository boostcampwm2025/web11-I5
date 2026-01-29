import { apiGet } from "@/lib/api-client";
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
    logger.error("스트릭 조회 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
export { fetchStreaks };
