import { apiGet } from "@/lib/api-client";
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
  if (params.page) {
    searchParams.set("page", params.page.toString());
  }
  if (params.size) {
    searchParams.set("size", params.size.toString());
  }

  const queryString = searchParams.toString();
  const endpoint = `/questions/${params.questionId}/others`;
  const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;

  return apiGet<PaginatedSubmissionDTO>(url);
}

export { fetchOthersSubmissions };
export type { FetchOthersSubmissionsParams };
