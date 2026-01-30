import { apiGet } from "@/lib/api-client";
import { OthersSubmissionDTO } from "../_types/types";

interface FetchOthersSubmissionsParams {
  questionId: number;
  submissionId: number;
}

async function fetchOthersSubmission(
  params: FetchOthersSubmissionsParams,
): Promise<OthersSubmissionDTO> {
  const searchParams = new URLSearchParams();
  const queryString = searchParams.toString();
  const endpoint = `/questions/${params.questionId}/others/${params.submissionId}`;
  const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;

  return apiGet<OthersSubmissionDTO>(url);
}

export { fetchOthersSubmission };
export type { FetchOthersSubmissionsParams };
