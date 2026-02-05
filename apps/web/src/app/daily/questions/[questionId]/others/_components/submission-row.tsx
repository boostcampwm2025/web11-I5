import { TableCell, TableRow } from "@/components/table/table";
import { ScoreBadge } from "@/components/score-badge/score-badge";
import { maskNickname } from "@/lib/mask-nickname";
import { User } from "lucide-react";
import Link from "next/link";
import { Submission } from "../_types/types";
import formatSubmittedAt from "../_lib/format-submitted-at";

interface SubmissionRowProps {
  submission: Submission;
  questionId: string;
}

function SubmissionRow({ submission, questionId }: SubmissionRowProps) {
  return (
    <TableRow>
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
  );
}

export { SubmissionRow };
