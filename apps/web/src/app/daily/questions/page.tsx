import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination/pagination";
import { fetchQuestions } from "./_lib/fetch-questions";

interface QuestionListPageProps {
  searchParams: Promise<{ page?: string }>;
}

async function QuestionListPage({ searchParams }: QuestionListPageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const { questions, totalCount, pageSize, totalPages } = await fetchQuestions({
    page: currentPage,
  });

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <main className="max-w-4xl mx-auto px-8 py-15 space-y-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">문제 리스트</h1>
        <p className="text-muted-foreground">
          총 <span className="font-semibold text-teal-600">{totalCount}</span>
          개의 문제가 준비되어 있습니다.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">대분류</TableHead>
            <TableHead className="w-32">중분류</TableHead>
            <TableHead>문제 제목</TableHead>
            <TableHead className="w-20 text-center">중요도</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
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
                <Link
                  href={`/daily/questions/${question.id}`}
                  className="hover:text-teal-600 hover:underline"
                >
                  {question.title}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                {question.avgImportance.toFixed(1)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={2}>
              <span className="text-muted-foreground text-sm">
                {startIndex} - {endIndex} / 총 {totalCount}개
              </span>
            </TableCell>
            <TableCell colSpan={2} className="text-right">
              <Pagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    {currentPage > 1 ? (
                      <PaginationPrevious
                        href={`/daily/questions?page=${currentPage - 1}`}
                      />
                    ) : (
                      <PaginationPrevious
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
                        href={`/daily/questions?page=${currentPage + 1}`}
                      />
                    ) : (
                      <PaginationNext
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
    </main>
  );
}

export default QuestionListPage;
