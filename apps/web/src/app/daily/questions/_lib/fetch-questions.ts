import { apiGet, checkAuthUser } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { PaginatedQuestionsDTO } from "../_types/types";

interface FetchQuestionsParams {
  page?: number;
  categoryId?: number;
  parentCategoryId?: number;
  search?: string;
  solvedStatus?: string;
  minImportance?: number;
}

async function fetchQuestions(
  params: FetchQuestionsParams = {},
): Promise<PaginatedQuestionsDTO> {
  const searchParams = new URLSearchParams();
  if (params.page) {
    searchParams.set("page", params.page.toString());
  }
  if (params.categoryId) {
    searchParams.set("categoryId", params.categoryId.toString());
  }
  if (params.parentCategoryId) {
    searchParams.set("parentCategoryId", params.parentCategoryId.toString());
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.solvedStatus) {
    searchParams.set("solvedStatus", params.solvedStatus.toUpperCase());
  }
  if (params.minImportance !== undefined) {
    searchParams.set("minImportance", params.minImportance.toString());
  }

  const queryString = searchParams.toString();
  const userStatus = await checkAuthUser();
  const endpoint = userStatus ? `/questions/auth` : `/questions`;
  const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;

  try {
    return await apiGet<PaginatedQuestionsDTO>(url);
  } catch (err) {
    if (userStatus && err instanceof ApiError && err.status === 401) {
      const fallbackUrl = `/questions${queryString ? `?${queryString}` : ""}`;
      return apiGet<PaginatedQuestionsDTO>(fallbackUrl);
    }
    throw err;
  }
}

export { fetchQuestions };
export type { FetchQuestionsParams };
