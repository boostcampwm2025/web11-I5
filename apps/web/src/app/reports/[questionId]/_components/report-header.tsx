import { Question } from "@/app/daily/questions/_types/types";
import RetryButton from "./retry-button";
import { Button } from "@/components/button/button";
import Link from "next/link";
import { Users } from "lucide-react";

type ReportQuestion = Question & {
  categoryDisplay: string;
  subCategory: string;
};

interface ReportHeaderProps {
  question: ReportQuestion;
  highestScore?: number;
}

function ReportHeader({ question, highestScore }: ReportHeaderProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-9">
      <div className="text-gray-500 text-sm mb-3 flex items-center justify-between">
        <div>
          {question.categoryDisplay}{" "}
          {question.subCategory && `| ${question.subCategory}`}
        </div>
        <div className="text-sm bg-teal-50 border border-teal-100 text-teal-500 px-2 py-0.5 rounded-sm font-bold">
          나의 최고 점수 : {highestScore ?? 0}점
        </div>
      </div>
      <h2 className="text-xl font-bold mb-3">{question.title}</h2>
      <p className="text-gray-600 leading-relaxed mb-6">{question.content}</p>
      <hr className="border-gray-200 mb-6" />
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          asChild
          className="font-semibold text-slate-600"
        >
          <Link href={`/daily/questions/${question.id}/others`}>
            <Users />
            다른 사람 답변 보기
          </Link>
        </Button>
        <RetryButton question={question} />
      </div>
    </section>
  );
}

export default ReportHeader;
