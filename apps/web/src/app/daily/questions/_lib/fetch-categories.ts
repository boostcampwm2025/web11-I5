import { Category } from "../_types/types";

async function fetchRootCategories(): Promise<Category[]> {
  const apiUrl = process.env.API_URL;

  const response = await fetch(`${apiUrl}/categories/roots`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return await response.json();
}

async function fetchCategoryTree(categoryId: number): Promise<Category | null> {
  const apiUrl = process.env.API_URL;

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
