import { apiGet } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/sentry-logger";
import { Category } from "../_types/types";

async function fetchRootCategories(): Promise<Category[]> {
  try {
    return await apiGet<Category[]>("/categories/roots");
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error("카테고리 목록 조회 실패", {
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

async function fetchCategoryTree(categoryId: number): Promise<Category | null> {
  try {
    return await apiGet<Category>(`/categories/tree-by-id/${categoryId}`);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound()) {
      return null;
    }
    if (error instanceof ApiError) {
      logger.error("카테고리 트리 조회 실패", {
        categoryId,
        status: error.status,
        errorType: error.getErrorType(),
        serverMessage: error.getServerMessage(),
        requestId: error.getRequestId(),
      });
    }
    throw error;
  }
}

export { fetchCategoryTree, fetchRootCategories };
