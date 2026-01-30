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
import { User } from "lucide-react";
import Link from "next/link";
import { fetchOthersSubmissions } from "./_lib/fetch-others-submissions";
import formatSubmittedAt from "./_lib/format-submitted-at";
import parseIntOrNull from "@/lib/parse-int-or-null";
import { notFound } from "next/navigation";
import { ScoreBadge } from "@/components/score-badge/score-badge";

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
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-15 space-y-6 md:space-y-8 min-h-main">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="font-medium">
              {question.category?.parent?.name}
            </span>
            <span>/</span>
            <span className="font-medium">{question.category?.name}</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
          <p className="text-muted-foreground">
            총 <span className="font-semibold text-teal-600">{totalCount}</span>
            명이 이 문제를 풀었습니다.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사용자</TableHead>
              <TableHead className="text-center w-24">점수</TableHead>
              <TableHead className="w-24 text-center">상세</TableHead>
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
                          {submission.nickname}
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