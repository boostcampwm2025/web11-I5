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

// 목 데이터 타입
interface Submission {
  id: number;
  user: {
    id: number;
    nickname: string;
    avatarUrl?: string;
  };
  score: number;
  submittedAt: string;
}

interface QuestionInfo {
  id: number;
  title: string;
  category: {
    id: number;
    name: string;
    parent: {
      id: number;
      name: string;
    };
  };
}

// 목 데이터 생성
const mockQuestion: QuestionInfo = {
  id: 1,
  title: "REST API와 GraphQL의 차이점을 설명해주세요.",
  category: {
    id: 2,
    name: "API 설계",
    parent: {
      id: 1,
      name: "백엔드",
    },
  },
};

const mockSubmissions: Submission[] = [
  {
    id: 1,
    user: { id: 1, nickname: "김철수" },
    score: 95,
    submittedAt: "2025-01-27T10:30:00Z",
  },
  {
    id: 2,
    user: { id: 2, nickname: "이영희" },
    score: 88,
    submittedAt: "2025-01-27T09:15:00Z",
  },
  {
    id: 3,
    user: { id: 3, nickname: "박민수" },
    score: 92,
    submittedAt: "2025-01-26T14:20:00Z",
  },
  {
    id: 4,
    user: { id: 4, nickname: "최지은" },
    score: 78,
    submittedAt: "2025-01-26T11:45:00Z",
  },
  {
    id: 5,
    user: { id: 5, nickname: "정하늘" },
    score: 85,
    submittedAt: "2025-01-25T16:30:00Z",
  },
  {
    id: 6,
    user: { id: 6, nickname: "강우진" },
    score: 91,
    submittedAt: "2025-01-25T13:00:00Z",
  },
  {
    id: 7,
    user: { id: 7, nickname: "윤서연" },
    score: 82,
    submittedAt: "2025-01-24T17:45:00Z",
  },
  {
    id: 8,
    user: { id: 8, nickname: "임동현" },
    score: 76,
    submittedAt: "2025-01-24T10:20:00Z",
  },
  {
    id: 9,
    user: { id: 9, nickname: "한소희" },
    score: 89,
    submittedAt: "2025-01-23T15:10:00Z",
  },
  {
    id: 10,
    user: { id: 10, nickname: "조민재" },
    score: 94,
    submittedAt: "2025-01-23T09:30:00Z",
  },
  {
    id: 11,
    user: { id: 11, nickname: "서지훈" },
    score: 87,
    submittedAt: "2025-01-22T14:00:00Z",
  },
  {
    id: 12,
    user: { id: 12, nickname: "노은비" },
    score: 80,
    submittedAt: "2025-01-22T11:30:00Z",
  },
];

interface OthersPageProps {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function OthersPage({ params, searchParams }: OthersPageProps) {
  const { questionId } = await params;
  const { page } = await searchParams;

  // 목 데이터 사용 (실제로는 API 호출)
  const question = mockQuestion;
  const allSubmissions = mockSubmissions;

  const pageSize = 10;
  const totalCount = allSubmissions.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const parsedPage = page ? parseInt(page, 10) : 1;
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

  const formatSubmittedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-8 py-15 space-y-8 min-h-main">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-base text-muted-foreground mb-2">
          <span className="font-medium">{question.category.parent.name}</span>
          <span>/</span>
          <span className="text-base font-medium">
            {question.category.name}
          </span>
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
            <TableHead>제출 시각</TableHead>
            <TableHead className="text-center">점수</TableHead>
            <TableHead className="w-24 text-center">상세</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground text-base"
              >
                아직 제출된 답변이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="font-medium text-base">
                      {submission.user.nickname}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatSubmittedAt(submission.submittedAt)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-teal-600 font-medium text-base bg-teal-50 px-2 py-1 rounded-sm">
                    {submission.score}점
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Link
                    href={`/daily/questions/${questionId}/others/${submission.id}`}
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
            <TableCell colSpan={2}>
              <span className="text-muted-foreground text-sm">
                {displayStartIndex} - {displayEndIndex} / 총 {totalCount}개
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
    </main>
  );
}

export default OthersPage;
