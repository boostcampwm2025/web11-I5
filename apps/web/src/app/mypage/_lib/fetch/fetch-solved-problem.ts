import { apiGet } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";
import { SolvedProblemResDto } from "../../_types/solved-problem";

async function fetchSolvedProblem(): Promise<SolvedProblemResDto> {
  try {
    return await apiGet<SolvedProblemResDto>("/api/users/solved-problems");
  } catch (error) {
    logger.error("풀이 문제 목록 조회 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export { fetchSolvedProblem };
