import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";
import { PaginatedSubmissionDTO } from "../_types/types";

interface FetchOthersSubmissionsParams {
  page?: number;
  size?: number;
  questionId: number;
}

async function fetchOthersSubmissions(
  params: FetchOthersSubmissionsParams,
): Promise<PaginatedSubmissionDTO> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) {
    searchParams.set("page", params.page.toString());
  }
  if (params.size !== undefined) {
    searchParams.set("size", params.size.toString());
  }

  const queryString = searchParams.toString();
  const endpoint = `/questions/${params.questionId}/others`;
  const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;

  try {
    return await apiGet<PaginatedSubmissionDTO>(url);
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("다른 사람 답변 목록 조회 실패", {
        questionId: params.questionId,
        page: params.page,
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

export { fetchOthersSubmissions };
export type { FetchOthersSubmissionsParams };
