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
      <div className="flex py-8 justify-between items-center">
        <div className="flex flex-col justify-start gap-2">
          <span className="text-lg font-bold text-slate-900">
            내가 푼 문제 리스트
          </span>
          <span className="text-sm font-medium text-slate-500">
            어떤 문제를 풀었는지 확인할 수 있습니다.
          </span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">분류</TableHead>
            <TableHead>문제 제목</TableHead>
            <TableHead className="text-center">제출 시간</TableHead>
            <TableHead className="text-center">내 최고 점수</TableHead>
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
                <TableCell>
                  <span className="text-sm py-1 px-2 bg-muted text-muted-foreground rounded-sm font-medium">
                    {problem.category}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/reports/${problem.questionId}`}
                    className="text-slate-900 font-medium text-sm hover:text-teal-600 hover:cursor-pointer hover:underline"
                  >
                    {problem.title}
                  </Link>
                </TableCell>
                <TableCell className="text-center">
                  {formattingDate(problem.completedAt)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-teal-600 font-medium text-sm bg-teal-50 px-2 py-1 rounded-sm">
                    {problem.score}
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
