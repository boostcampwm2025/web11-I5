import { http, HttpResponse } from "msw";
import { mockCategories, mockCategoryTrees } from "../data/categories";

const API_URL = process.env.API_URL || "http://localhost:8000";

export const categoryHandlers = [
  // 카테고리 루트 목록
  http.get(`${API_URL}/categories/roots`, () => {
    return HttpResponse.json(mockCategories);
  }),

  // 카테고리 트리
  http.get(`${API_URL}/categories/tree-by-id/:categoryId`, ({ params }) => {
    const categoryId = Number(params.categoryId);
    const tree = mockCategoryTrees[categoryId];
    if (tree) {
      return HttpResponse.json(tree);
    }
    return new HttpResponse(null, { status: 404 });
  }),
];
