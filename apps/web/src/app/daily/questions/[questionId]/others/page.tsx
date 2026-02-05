import Header from "@/components/header/header";
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
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb/breadcrumb";
import { fetchOthersSubmissions } from "./_lib/fetch-others-submissions";
import parseIntOrNull from "@/lib/parse-int-or-null";
import { notFound } from "next/navigation";
import { QuestionHeader } from "./_components/question-header";
import { SubmissionRow } from "./_components/submission-row";
import { EmptyState } from "./_components/empty-state";
import { PaginationControls } from "./_components/pagination-controls";

interface OthersPageProps {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function OthersPage({ params, searchParams }: OthersPageProps) {
  const { questionId } = await params;
  const { page } = await searchParams;

  const parsedQuestionId = parseIntOrNull(questionId);
  const parsedPage = parseIntOrNull(page) ?? 1;

  if (!parsedQuestionId) {
    return notFound();
  }

  const {
    question,
    submissions,
    totalCount,
    pageSize,
    currentPage,
    totalPages,
  } = await fetchOthersSubmissions({
    questionId: parsedQuestionId,
    page: parsedPage,
  });

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex =
    totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount);

  const buildPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", pageNum.toString());
    return `/daily/questions/${questionId}/others?${params.toString()}`;
  };

  return (
    <>
      <Header />
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8 md:pb-15 space-y-6 md:space-y-8 min-h-main">
        <Breadcrumb className="md:-ml-1.5 mb-4 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/reports/${questionId}`}>
                나의 리포트
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>다른 사람 답변</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <QuestionHeader
          category={question.category?.parent?.name}
          subCategory={question.category?.name}
          title={question.title}
          totalCount={totalCount}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">사용자</TableHead>
              <TableHead scope="col" className="text-center w-24">
                점수
              </TableHead>
              <TableHead scope="col" className="w-24 text-center">
                상세
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {submissions.length === 0 ? (
              <EmptyState />
            ) : (
              submissions.map((submission) => (
                <SubmissionRow
                  key={submission.submissionId}
                  submission={submission}
                  questionId={questionId}
                />
              ))
            )}
          </TableBody>

          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {startIndex} - {endIndex} / 총 {totalCount}개
                </span>
              </TableCell>

              <TableCell colSpan={2} className="text-right">
                {totalPages > 0 ? (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    buildUrl={buildPaginationUrl}
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </main>
    </>
  );
}

export default OthersPage;
