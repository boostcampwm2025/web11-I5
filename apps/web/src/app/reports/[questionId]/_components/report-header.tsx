import { Question } from "@/app/daily/questions/_types/types";
import RetryButton from "./retry-button";

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
      <p className="text-gray-500 text-xs mb-3">
        {question.categoryDisplay}{" "}
        {question.subCategory && `| ${question.subCategory}`}
      </p>
      <h2 className="text-xl font-bold mb-3">{question.title}</h2>
      <p className="text-gray-600 leading-relaxed mb-6">{question.content}</p>
      <hr className="border-gray-200 mb-6" />
      <div className="flex items-center justify-between">
        <div className="bg-teal-50 border border-teal-100 text-teal-600 px-4 py-2.5 rounded-xl text-sm font-bold">
          나의 최고 점수 : {highestScore ?? 0}점
        </div>
        <RetryButton
          question={question}
          className="flex cursor-pointer items-center gap-2.5 bg-teal-400 hover:bg-teal-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        />
      </div>
    </section>
  );
}

export default ReportHeader;
