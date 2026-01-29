import { Suspense } from "react";
import Header from "@/components/header/header";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table/table";
import QuestionFilters from "./_components/question-filters";
import {
  QuestionsTableBodySection,
  TableLoadingFallback,
} from "./_components/questions-table-section";
import {
  TotalCountSection,
  TotalCountLoadingFallback,
} from "./_components/total-count-section";
import {
  fetchCategoryTree,
  fetchRootCategories,
} from "./_lib/fetch-categories";

interface QuestionListPageProps {
  searchParams: Promise<{
    page?: string;
    categoryId?: string;
    subCategoryId?: string;
    search?: string;
    solvedStatus?: string;
    minImportance?: string;
  }>;
}

async function QuestionListPage({ searchParams }: QuestionListPageProps) {
  const {
    page,
    categoryId,
    subCategoryId,
    search,
    solvedStatus,
    minImportance,
  } = await searchParams;

  const parseIntOrNull = (value: string | undefined): number | null => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseFloatOrNull = (value: string | undefined): number | null => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parsedPage = parseIntOrNull(page);
  const currentPage = parsedPage && parsedPage >= 1 ? parsedPage : 1;
  const selectedCategoryId = parseIntOrNull(categoryId);
  const selectedSubCategoryId = parseIntOrNull(subCategoryId);
  const searchQuery = search ?? "";
  const selectedSolvedStatus = solvedStatus ?? null;
  const selectedMinImportance = parseFloatOrNull(minImportance);

  const rootCategoriesPromise = fetchRootCategories();
  const categoryTreePromise = selectedCategoryId
    ? fetchCategoryTree(selectedCategoryId)
    : Promise.resolve(null);

  const [rootCategories, selectedCategoryTree] = await Promise.all([
    rootCategoriesPromise,
    categoryTreePromise,
  ]);

  const subCategories = selectedCategoryTree?.children ?? [];

  return (
    <>
      <Header />
      <main className="w-full max-w-4xl mx-auto px-8 py-15 space-y-8 min-h-main">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">문제 리스트</h1>
          <Suspense fallback={<TotalCountLoadingFallback />}>
            <TotalCountSection
              selectedCategoryId={selectedCategoryId}
              selectedSubCategoryId={selectedSubCategoryId}
              searchQuery={searchQuery}
              selectedSolvedStatus={selectedSolvedStatus}
              selectedMinImportance={selectedMinImportance}
            />
          </Suspense>
        </div>
        <QuestionFilters
          categories={rootCategories}
          subCategories={subCategories}
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          searchQuery={searchQuery}
          selectedSolvedStatus={selectedSolvedStatus}
          selectedMinImportance={selectedMinImportance}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">대분류</TableHead>
              <TableHead className="w-32">중분류</TableHead>
              <TableHead>문제 제목</TableHead>
              <TableHead className="w-20 text-center">중요도</TableHead>
              <TableHead className="w-20 text-center">내 점수</TableHead>
            </TableRow>
          </TableHeader>
          <Suspense fallback={<TableLoadingFallback />}>
            <QuestionsTableBodySection
              currentPage={currentPage}
              selectedCategoryId={selectedCategoryId}
              selectedSubCategoryId={selectedSubCategoryId}
              searchQuery={searchQuery}
              selectedSolvedStatus={selectedSolvedStatus}
              selectedMinImportance={selectedMinImportance}
              rawSearchParams={{
                page,
                categoryId,
                subCategoryId,
                search,
                solvedStatus,
                minImportance,
              }}
            />
          </Suspense>
        </Table>
        <div data-boostad-zone></div>
      </main>
    </>
  );
}

export default QuestionListPage;
