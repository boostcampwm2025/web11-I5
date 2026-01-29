import { AnalysisStatus, ReportDetail } from "../../_types/report-detail";
import ScoreGauge from "./score-gauge";
import AiFeedback from "./ai-feedback";
import MetricsList from "./metrics-list";
import { AlertCircle } from "lucide-react";
import { Question } from "@/app/daily/questions/_types/types";
import RetryButton from "../retry-button";
import ReEvaluateButton from "../re-evaluate-button";

interface FeedbackSectionProps {
  attempt: number;
  status: AnalysisStatus;
  data: ReportDetail;
  question: Question;
}

function FeedbackSection({
  attempt,
  status,
  data,
  question,
}: FeedbackSectionProps) {
  if (status === "PENDING") {
    const isSttPending =
      data.sttStatus === "IN_PROGRESS" || data.sttStatus === "PENDING";

    return (
      <section className="p-5 md:p-9 transition-all duration-300">
        <div className="flex flex-col items-center justify-center py-8 md:py-12 gap-4 md:gap-6">
          <div className="w-10 h-10 md:w-14 md:h-14 border-4 border-[#4FD1C5] border-t-transparent rounded-full animate-spin" />

          <div className="text-center px-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">
              {isSttPending
                ? "음성을 텍스트로 변환하고 있습니다"
                : "답변을 분석하고 있습니다"}
            </h2>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed">
              {isSttPending
                ? "음성 인식 중입니다."
                : "AI 면접관이 5가지 핵심 지표를 기반으로 채점 중 입니다."}
            </p>
            <p className="text-sm md:text-base text-slate-500">
              잠시만 기다려주세요. (약 5~10초 소요)
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (status === "FAILED") {
    const isSttFailed = data.sttStatus === "FAILED";

    return (
      <section className="p-5 md:p-9 transition-all duration-300">
        <div className="flex flex-col items-center justify-center py-8 md:py-12 gap-4 md:gap-6">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
          </div>

          <div className="text-center px-4">
            <h2 className="font-bold text-slate-900 mb-2 md:mb-3 text-lg md:text-xl">
              {isSttFailed ? "음성 인식에 실패했습니다" : "채점에 실패했습니다"}
            </h2>
            <p className="text-sm md:text-base text-slate-500">
              {isSttFailed
                ? "오디오 파일 형식이 손상되어 분석할 수 없습니다."
                : "채점 처리 중 오류가 발생했습니다. 다시 시도해주세요."}
            </p>
          </div>

          {isSttFailed ? (
            <RetryButton
              question={question}
              className="flex cursor-pointer items-center gap-2 md:gap-2.5 bg-teal-400 hover:bg-teal-500 text-white font-bold px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-colors text-sm md:text-base"
            />
          ) : (
            <ReEvaluateButton
              submissionId={data.submissionId}
              className="flex cursor-pointer items-center gap-2 md:gap-2.5 bg-teal-400 hover:bg-teal-500 text-white font-bold px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-colors text-sm md:text-base"
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="p-5 md:p-9 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        <div>
          <div className="text-xs md:text-sm font-extrabold text-zinc-400 tracking-widest uppercase mb-1">
            TRIAL #{attempt}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-1">
            분석 리포트
          </h2>
          <div className="text-xs md:text-sm text-zinc-400">
            {data.date} 완료
          </div>
        </div>

        <ScoreGauge score={data.totalScore ?? 0} />
      </div>

      {data.feedback && <AiFeedback feedback={data.feedback.feedbackMessage} />}

      <MetricsList feedback={data.feedback} isPending={false} />
    </section>
  );
}

export default FeedbackSection;
