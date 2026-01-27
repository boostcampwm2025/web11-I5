import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table/table";
import QuestionFilters from "./_components/question-filters";
import { QuestionLinkButton } from "./_components/question-link-button";
import {
  fetchCategoryTree,
  fetchRootCategories,
} from "./_lib/fetch-categories";
import { fetchQuestions } from "./_lib/fetch-questions";

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
  const questionsPromise = fetchQuestions({
    page: currentPage,
    parentCategoryId: selectedCategoryId ?? undefined,
    categoryId: selectedSubCategoryId ?? undefined,
    search: searchQuery || undefined,
    solvedStatus: selectedSolvedStatus ?? undefined,
    minImportance: selectedMinImportance ?? undefined,
  });

  const [rootCategories, selectedCategoryTree, questionsData] =
    await Promise.all([
      rootCategoriesPromise,
      categoryTreePromise,
      questionsPromise,
    ]);

  const { questions, totalCount, pageSize, totalPages } = questionsData;
  const subCategories = selectedCategoryTree?.children ?? [];

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex =
    totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount);

  const buildPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", pageNum.toString());
    if (categoryId) params.set("categoryId", categoryId);
    if (subCategoryId) params.set("subCategoryId", subCategoryId);
    if (searchQuery) params.set("search", searchQuery);
    if (solvedStatus) params.set("solvedStatus", solvedStatus);
    if (minImportance) params.set("minImportance", minImportance);
    return `/daily/questions?${params.toString()}`;
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-8 py-15 space-y-8 min-h-main">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">문제 리스트</h1>
        <p className="text-muted-foreground">
          총 <span className="font-semibold text-teal-600">{totalCount}</span>
          개의 문제가 준비되어 있습니다.
        </p>
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
        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground text-base"
              >
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="text-muted-foreground font-medium">
                  {question.category?.parent?.name ?? "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="text-sm py-1 px-2 bg-muted text-muted-foreground rounded-sm font-medium">
                    {question.category?.name ?? "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <QuestionLinkButton question={question} />
                </TableCell>
                <TableCell className="text-center text-base">
                  {(question.avgImportance ?? 0).toFixed(1)}
                </TableCell>
                <TableCell className="text-center">
                  {question.score !== null ? (
                    <span className="text-teal-600 font-medium text-base bg-teal-50 px-2 py-1 rounded-sm">
                      {question.score}점
                    </span>
                  ) : (
                    ""
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={2}>
              <span className="text-muted-foreground text-sm">
                {startIndex} - {endIndex} / 총 {totalCount}개
              </span>
            </TableCell>
            <TableCell colSpan={3} className="text-right">
              <Pagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    {currentPage > 1 ? (
                      <PaginationPrevious
                        href={buildPaginationUrl(currentPage - 1)}
                      />
                    ) : (
                      <PaginationPrevious
                        href={buildPaginationUrl(currentPage)}
                        className="pointer-events-none opacity-50"
                        aria-disabled="true"
                      />
                    )}
                  </PaginationItem>
                  <PaginationItem>
                    <div className="px-2">
                      {currentPage} / {totalPages}
                    </div>
                  </PaginationItem>
                  <PaginationItem>
                    {currentPage < totalPages ? (
                      <PaginationNext
                        href={buildPaginationUrl(currentPage + 1)}
                      />
                    ) : (
                      <PaginationNext
                        href={buildPaginationUrl(currentPage)}
                        className="pointer-events-none opacity-50"
                        aria-disabled="true"
                      />
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div data-boostad-zone></div>
    </main>
  );
}

export default QuestionListPage;
