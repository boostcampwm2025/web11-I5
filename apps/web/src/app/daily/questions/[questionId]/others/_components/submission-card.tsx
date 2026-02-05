import ScoreGauge from "@/app/reports/[questionId]/_components/feedback/score-gauge";
import { UserInfo } from "./user-info";
import { AnswerContent } from "./answer-content";
import { KeywordsSection } from "./keywords-section";

interface SubmissionCardProps {
  nickname: string;
  submittedAt: string;
  totalScore: number;
  answerContent: string;
  keywords: string[];
}

function SubmissionCard({
  nickname,
  submittedAt,
  totalScore,
  answerContent,
  keywords,
}: SubmissionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 md:p-9 bg-white">
        <div className="flex mb-5 md:mb-10 justify-between items-center">
          <UserInfo nickname={nickname} submittedAt={submittedAt} />
          <ScoreGauge score={totalScore} />
        </div>

        <div className="flex justify-between items-center mb-3 md:mb-6">
          <h3 className="text-lg font-bold text-slate-900">답변 원문</h3>
        </div>

        <AnswerContent content={answerContent || null} />
        <KeywordsSection keywords={keywords} />
      </div>
    </div>
  );
}

export { SubmissionCard };
