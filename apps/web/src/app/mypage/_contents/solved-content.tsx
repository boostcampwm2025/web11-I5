import { CategoryBadge } from "@/components/category-badge/category-badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination/pagination";
import { ScoreBadge } from "@/components/score-badge/score-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table/table";
import Link from "next/link";
import { SolvedProblem } from "../_types/solved-problem";

interface SolvedContentProps {
  solvedProblems: SolvedProblem[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

function SolvedContent({
  solvedProblems,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: SolvedContentProps) {
  const formattingDate = (completedAt: string) => {
    const date = new Date(completedAt);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex =
    totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount);

  const buildUrl = (page: number) => `?page=${page}`;

  return (
    <>
      <div className="flex py-6 md:py-8 justify-between items-center">
        <div className="flex flex-col justify-start gap-1 md:gap-2">
          <span className="text-base md:text-lg font-bold text-slate-900">
            내가 푼 문제 리스트
          </span>
          <span className="text-xs md:text-sm font-medium text-slate-500">
            어떤 문제를 풀었는지 확인할 수 있습니다.
          </span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 hidden sm:table-cell">분류</TableHead>
            <TableHead>문제 제목</TableHead>
            <TableHead className="text-center hidden md:table-cell">
              제출 시간
            </TableHead>
            <TableHead className="text-center w-24 md:w-auto">
              내 점수
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solvedProblems.length === 0 ? (
            <TableRow>
              <TableCell
                className="h-32 text-center text-muted-foreground"
                colSpan={4}
              >
                푼 문제가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            solvedProblems.map((problem) => (
              <TableRow key={problem.questionId}>
                <TableCell className="hidden sm:table-cell">
                  <CategoryBadge
                    category={problem.parentCategory}
                    subCategory={problem.category}
                    orientation="vertical"
                  />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Link
                    href={`/reports/${problem.questionId}`}
                    className="text-slate-900 font-medium text-sm hover:text-teal-600 hover:cursor-pointer hover:underline"
                  >
                    {problem.title}
                  </Link>
                  <div className="sm:hidden text-xs text-muted-foreground mt-1">
                    {problem.category}
                  </div>
                  <div className="md:hidden text-xs text-muted-foreground mt-0.5">
                    {formattingDate(problem.completedAt)}
                  </div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  {formattingDate(problem.completedAt)}
                </TableCell>
                <TableCell className="text-center">
                  <ScoreBadge score={problem.score} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {totalCount > 0 && (
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={1} className="hidden sm:table-cell">
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
                            href={buildUrl(currentPage - 1)}
                          />
                        ) : (
                          <PaginationPrevious
                            href={buildUrl(currentPage)}
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
                          <PaginationNext href={buildUrl(currentPage + 1)} />
                        ) : (
                          <PaginationNext
                            href={buildUrl(currentPage)}
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
        )}
      </Table>
    </>
  );
}

export default SolvedContent;
