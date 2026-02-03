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
    <section className="bg-white border border-gray-200 rounded-xl p-5 md:p-9">
      <div className="text-gray-500 text-xs md:text-sm mb-2 md:mb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          {question.categoryDisplay}{" "}
          {question.subCategory && `| ${question.subCategory}`}
        </div>
        <div className="text-xs md:text-sm bg-teal-50 border border-teal-100 text-teal-500 px-2 py-0.5 rounded-sm font-bold w-fit">
          나의 최고 점수 : {highestScore ?? 0}점
        </div>
      </div>
      <h1 className="text-lg md:text-xl font-bold mb-2 md:mb-3">
        {question.title}
      </h1>
      <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 md:mb-6">
        {question.content}
      </p>
      <hr className="border-gray-200 mb-4 md:mb-6" />
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-end">
        <Button
          variant="outline"
          asChild
          className="font-semibold text-slate-600"
        >
          <Link href={`/daily/questions/${question.id}/others`}>
            <Users className="w-4 h-4" aria-hidden="true" />
            다른 사람 답변 보기
          </Link>
        </Button>
        <RetryButton question={question} />
      </div>
    </section>
  );
}

export default ReportHeader;
