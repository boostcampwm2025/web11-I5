import { apiGet } from "@/lib/api-client";
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
    logger.error("풀이 문제 목록 조회 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export { fetchSolvedProblems };
