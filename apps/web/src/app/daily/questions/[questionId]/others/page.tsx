import Header from "@/components/header/header";
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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb/breadcrumb";
import { User } from "lucide-react";
import Link from "next/link";
import { fetchOthersSubmissions } from "./_lib/fetch-others-submissions";
import formatSubmittedAt from "./_lib/format-submitted-at";
import { maskNickname } from "@/lib/mask-nickname";
import parseIntOrNull from "@/lib/parse-int-or-null";
import { notFound } from "next/navigation";
import { ScoreBadge } from "@/components/score-badge/score-badge";
import { CategoryBadge } from "@/components/category-badge/category-badge";

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

  const submissionsData = await fetchOthersSubmissions({
    questionId: parsedQuestionId,
    page: parsedPage,
  });

  // 목 데이터 사용 (실제로는 API 호출)
  const question = submissionsData.question;
  const allSubmissions = submissionsData.submissions;

  const pageSize = 10;
  const totalCount = allSubmissions.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const currentPage =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const submissions = allSubmissions.slice(startIndex, endIndex);

  const displayStartIndex = totalCount === 0 ? 0 : startIndex + 1;
  const displayEndIndex = totalCount === 0 ? 0 : endIndex;

  const buildPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", pageNum.toString());
    return `/daily/questions/${questionId}/others?${params.toString()}`;
  };

  return (
    <>
      <Header />
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8 md:pb-15 space-y-6 md:space-y-8 min-h-main">
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

        <div className="mb-8">
          <CategoryBadge
            category={question.category?.parent?.name}
            subCategory={question.category?.name}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
          <p className="text-muted-foreground">
            총 <span className="font-semibold text-teal-600">{totalCount}</span>
            명이 이 문제를 풀었습니다.
          </p>
        </div>

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
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-32 text-center text-muted-foreground"
                >
                  아직 제출된 답변이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.submissionId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>

                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {maskNickname(submission.nickname)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {formatSubmittedAt(submission.submittedAt)}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <ScoreBadge score={submission.totalScore} />
                  </TableCell>

                  <TableCell className="text-center">
                    <Link
                      href={`/daily/questions/${questionId}/others/${submission.submissionId}`}
                      className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                      aria-label={`${submission.nickname}의 답변 보기`}
                    >
                      답변 보기
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {displayStartIndex} - {displayEndIndex} / 총 {totalCount}개
                </span>
              </TableCell>

              <TableCell colSpan={2} className="text-right">
                {/* totalPages > 0일 때만 이전/다음 버튼과 현재/전체 표시, 데이터 없을 때는 —만 표시 */}
                {totalPages > 0 ? (
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
                            tabIndex={-1}
                          />
                        )}
                      </PaginationItem>

                      <PaginationItem>
                        <div
                          className="px-2"
                          aria-label={`현재 ${currentPage}페이지, 전체 ${totalPages}페이지`}
                        >
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
                            tabIndex={-1}
                          />
                        )}
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
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
