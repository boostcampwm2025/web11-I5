import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table/table";
import Link from "next/link";
import { SolvedProblem } from "../_types/solved-problem";

async function SolvedContent({
  solvedProblems,
}: {
  solvedProblems: SolvedProblem[];
}) {
  const formattingDate = (completedAt: string) => {
    const date = new Date(completedAt);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };
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
                  <span className="text-xs md:text-sm py-1 px-2 bg-muted text-muted-foreground rounded-sm font-medium">
                    {problem.category}
                  </span>
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
                  <span className="text-teal-600 font-medium text-sm bg-teal-50 px-2 py-1 rounded-sm">
                    {problem.score}점
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}

export default SolvedContent;
