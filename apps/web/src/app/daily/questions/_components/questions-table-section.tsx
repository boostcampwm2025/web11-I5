import { Spinner } from "@/components/spinner/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination/pagination";
import {
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/table/table";
import { QuestionLinkButton } from "./question-link-button";
import { fetchQuestions } from "../_lib/fetch-questions";
import { ScoreBadge } from "@/components/score-badge/score-badge";

interface QuestionsTableBodySectionProps {
  currentPage: number;
  selectedCategoryId: number | null;
  selectedSubCategoryId: number | null;
  searchQuery: string;
  selectedSolvedStatus: string | null;
  selectedMinImportance: number | null;
  rawSearchParams: {
    page?: string;
    categoryId?: string;
    subCategoryId?: string;
    search?: string;
    solvedStatus?: string;
    minImportance?: string;
  };
}

async function QuestionsTableBodySection({
  currentPage,
  selectedCategoryId,
  selectedSubCategoryId,
  searchQuery,
  selectedSolvedStatus,
  selectedMinImportance,
  rawSearchParams,
}: QuestionsTableBodySectionProps) {
  const questionsData = await fetchQuestions({
    page: currentPage,
    parentCategoryId: selectedCategoryId ?? undefined,
    categoryId: selectedSubCategoryId ?? undefined,
    search: searchQuery || undefined,
    solvedStatus: selectedSolvedStatus ?? undefined,
    minImportance: selectedMinImportance ?? undefined,
  });

  const { questions, totalCount, pageSize, totalPages } = questionsData;

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex =
    totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount);

  const buildPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", pageNum.toString());
    if (rawSearchParams.categoryId)
      params.set("categoryId", rawSearchParams.categoryId);
    if (rawSearchParams.subCategoryId)
      params.set("subCategoryId", rawSearchParams.subCategoryId);
    if (rawSearchParams.search) params.set("search", rawSearchParams.search);
    if (rawSearchParams.solvedStatus)
      params.set("solvedStatus", rawSearchParams.solvedStatus);
    if (rawSearchParams.minImportance)
      params.set("minImportance", rawSearchParams.minImportance);
    return `/daily/questions?${params.toString()}`;
  };

  return (
    <>
      <TableBody>
        {questions.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-32 text-center text-muted-foreground"
            >
              검색 결과가 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell className="text-muted-foreground font-medium hidden md:table-cell">
                {question.category?.parent?.name ?? "-"}
              </TableCell>
              <TableCell className="text-muted-foreground hidden sm:table-cell">
                <span className="text-xs py-1 px-2 bg-muted text-muted-foreground rounded-sm font-medium whitespace-nowrap max-w-28 truncate inline-block">
                  {question.category?.name ?? "-"}
                </span>
              </TableCell>
              <TableCell className="whitespace-normal">
                <QuestionLinkButton question={question} />
                <div className="sm:hidden text-xs text-muted-foreground mt-1">
                  {[question.category?.parent?.name, question.category?.name]
                    .filter(Boolean)
                    .join(" > ")}
                </div>
              </TableCell>
              <TableCell className="text-center hidden sm:table-cell">
                {(question.avgImportance ?? 0).toFixed(1)}
              </TableCell>
              <TableCell className="text-center">
                {question.score !== null ? (
                  <ScoreBadge score={question.score} />
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
          <TableCell colSpan={2} className="hidden sm:table-cell">
            <span className="text-muted-foreground text-sm">
              {startIndex} - {endIndex} / 총 {totalCount}개
            </span>
          </TableCell>
          <TableCell colSpan={3} className="sm:text-right">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
              <span className="text-muted-foreground text-sm sm:hidden">
                {startIndex} - {endIndex} / 총 {totalCount}개
              </span>
              <Pagination className="justify-center sm:justify-end">
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
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
    </>
  );
}

function TableLoadingFallback() {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={5} className="h-96 text-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="w-8 h-8" />
            <p className="text-sm text-slate-500">문제를 불러오는 중입니다</p>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

export { QuestionsTableBodySection, TableLoadingFallback };
