import { apiGet } from "@/lib/api-client";
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
    console.error(error);
    throw error;
  }
}
export { fetchStreaks };
