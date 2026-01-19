import SearchHeader from "./_components/search-header";
import RootCategorySection from "./_components/root-category-section";
import { Category, Question } from "./_types/types";

export interface CategoryWithQuestions extends Category {
  questions: Question[];
}

export interface RootTree extends Category {
  children: CategoryWithQuestions[];
}

async function getFullCategoryTree(): Promise<RootTree[]> {
  const apiUrl = process.env.API_URL;
  try {
    const res = await fetch(`${apiUrl}/categories/roots`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch roots");
    const roots: Category[] = await res.json();

    return Promise.all(
      roots.map(async (root): Promise<RootTree> => {
        const treeRes = await fetch(
          `${apiUrl}/categories/tree-by-id/${root.id}`,
          {
            cache: "no-store",
          },
        );
        if (!treeRes.ok) throw new Error("Failed to fetch tree");
        const treeData: Category = await treeRes.json();

        const subCategories = treeData.children || [];

        const childrenWithQuestions = await Promise.all(
          subCategories.map(async (sub): Promise<CategoryWithQuestions> => {
            const qRes = await fetch(`${apiUrl}/questions/category/${sub.id}`, {
              cache: "no-store",
            });
            const questions = qRes.ok ? await qRes.json() : [];

            return {
              ...sub,
              questions: Array.isArray(questions) ? questions : [],
            };
          }),
        );

        return { ...root, children: childrenWithQuestions };
      }),
    );
  } catch (error) {
    console.error("Data fetching failed during build/runtime:", error);
    return [];
  }
}

async function QuestionListPage() {
  const roots = await getFullCategoryTree();

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8 bg-gray-50/30 min-h-screen">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          데일리 모드
        </h1>
        <p className="text-muted-foreground">
          원하는 CS 문제를 선택해서 학습하세요
        </p>
      </section>

      <SearchHeader />

      <section className="space-y-6">
        {roots.map((root) => (
          <RootCategorySection key={root.id} root={root} />
        ))}
      </section>
    </main>
  );
}
export default QuestionListPage;
