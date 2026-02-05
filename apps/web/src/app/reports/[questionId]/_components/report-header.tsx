import { Question } from "@/app/daily/questions/_types/types";
import RetryButton from "./retry-button";
import { Button } from "@/components/button/button";
import { CategoryBadge } from "@/components/category-badge/category-badge";
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
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <CategoryBadge
          category={question.categoryDisplay}
          subCategory={question.subCategory}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/daily/questions/${question.id}/others`}>
              <Users className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">다른 사람 답변</span>
              <span className="sm:hidden">다른 답변</span>
            </Link>
          </Button>
          <RetryButton question={question} size="sm" />
        </div>
      </div>

      <h1 className="text-xl md:text-2xl font-bold mb-2">{question.title}</h1>

      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
        {question.content}
      </p>

      <div className="text-sm text-teal-600 font-semibold">
        나의 최고 점수:{" "}
        <span className="text-teal-700">{highestScore ?? 0}점</span>
      </div>
    </section>
  );
}

export default ReportHeader;
