import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";
import { OthersSubmissionDTO } from "../_types/types";

interface FetchOthersSubmissionsParams {
  questionId: number;
  submissionId: number;
}

async function fetchOthersSubmission(
  params: FetchOthersSubmissionsParams,
): Promise<OthersSubmissionDTO> {
  const endpoint = `/questions/${params.questionId}/others/${params.submissionId}`;

  try {
    return await apiGet<OthersSubmissionDTO>(endpoint);
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("다른 사람 답변 단건 조회 실패", {
        questionId: params.questionId,
        submissionId: params.submissionId,
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

export { fetchOthersSubmission };
export type { FetchOthersSubmissionsParams };
