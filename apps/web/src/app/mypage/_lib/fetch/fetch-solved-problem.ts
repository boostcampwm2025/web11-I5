import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";
import { SolvedProblemResDto } from "../../_types/solved-problem";

async function fetchSolvedProblem(): Promise<SolvedProblemResDto> {
  try {
    return await apiGet<SolvedProblemResDto>("/api/users/solved-problems");
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("풀이 문제 목록 조회 실패", {
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

export { fetchSolvedProblem };
