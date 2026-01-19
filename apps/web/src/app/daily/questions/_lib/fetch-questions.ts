import { PaginatedQuestionsDTO } from "../_types/types";

interface FetchQuestionsParams {
  page?: number;
  categoryId?: number;
  parentCategoryId?: number;
  search?: string;
  minImportance?: number;
}

async function fetchQuestions(
  params: FetchQuestionsParams = {},
): Promise<PaginatedQuestionsDTO> {
  const apiUrl = process.env.API_URL;

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
  if (params.minImportance !== undefined) {
    searchParams.set("minImportance", params.minImportance.toString());
  }

  const queryString = searchParams.toString();
  const url = `${apiUrl}/questions${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`);
  }

  return await response.json();
}

export { fetchQuestions };
export type { FetchQuestionsParams };
