import { Category } from "../_types/types";

const getApiUrl = (): string =>
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

async function fetchRootCategories(): Promise<Category[]> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/categories/roots`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return await response.json();
}

async function fetchCategoryTree(categoryId: number): Promise<Category | null> {
  const apiUrl = getApiUrl();
  const response = await fetch(
    `${apiUrl}/categories/tree-by-id/${categoryId}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch category tree: ${response.statusText}`);
  }

  return await response.json();
}

export { fetchCategoryTree, fetchRootCategories };
