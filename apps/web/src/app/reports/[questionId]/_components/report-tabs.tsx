import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/tabs/tabs";
import { BookText, CircleCheckBig } from "lucide-react";
import FeedbackSection from "./feedback/feedback-section";
import { AnalysisStatus, ReportDetail } from "../_types/report-detail";
import { Question } from "@/app/daily/questions/_types/types";

type ReportQuestion = Question & {
  categoryDisplay: string;
  subCategory: string;
};

interface HistoryItem {
  submissionId: number;
  displayIndex: number;
  status: AnalysisStatus;
  duration: string;
  answerContent: string;
}

interface ReportTabsProps {
  selectedAttempt: HistoryItem;
  evaluation: ReportDetail;
  question: ReportQuestion;
}

function ReportTabs({
  selectedAttempt,
  evaluation,
  question,
}: ReportTabsProps) {
  const keywords =
    evaluation.status === "COMPLETED"
      ? evaluation.feedback.extractedKeywords
      : [];

  return (
    <Tabs defaultValue="feedback" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="feedback">
          <CircleCheckBig className="mr-2.5 w-4 h-4" /> 분석 리포트
        </TabsTrigger>
        <TabsTrigger value="answer">
          <BookText className="mr-2.5 w-4 h-4" /> 답변 스크립트
        </TabsTrigger>
      </TabsList>

      <TabsContent value="feedback">
        <FeedbackSection
          attempt={selectedAttempt.displayIndex}
          status={selectedAttempt.status}
          data={evaluation}
          question={question}
        />
      </TabsContent>

      <TabsContent value="answer">
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="p-9 bg-slate-50/30">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-[1.125rem] font-bold text-slate-900">
                  나의 답변 원문
                </h3>
              </div>
              {selectedAttempt.answerContent && (
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span className="text-xs text-slate-500">
                    AI 음성 복원 완료
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white py-6 border-y border-slate-200">
              {selectedAttempt.answerContent ? (
                <p className="text-[0.9375rem] leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {selectedAttempt.answerContent}
                </p>
              ) : (
                <p className="py-4 text-sm text-center text-slate-400">
                  저장된 답변이 없습니다.
                </p>
              )}
            </div>

            {keywords.length > 0 &&
              evaluation.totalScore &&
              evaluation.totalScore >= 30 && (
                <div className="mt-6">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-3">
                    CORE KEYWORDS
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md"
                      >
                        <span className="text-slate-400 font-semibold">#</span>{" "}
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default ReportTabs;
