import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";
import { SolvedProblemsResDto } from "../../_types/solved-problem";

interface FetchSolvedProblemParams {
  page?: number;
  size?: number;
}
async function fetchSolvedProblems(
  params: FetchSolvedProblemParams = {},
): Promise<SolvedProblemsResDto> {
  const searchParams = new URLSearchParams();
  if (params.page) {
    searchParams.set("page", params.page.toString());
  }
  if (params.size) {
    searchParams.set("size", params.size.toString());
  }

  const queryString = searchParams.toString();
  const baseUrl = "/api/users/solved-problems";
  try {
    return await apiGet<SolvedProblemsResDto>(`${baseUrl}?${queryString}`);
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

export { fetchSolvedProblems };
