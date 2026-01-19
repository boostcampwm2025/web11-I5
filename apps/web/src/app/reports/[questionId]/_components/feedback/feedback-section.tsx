import { AnalysisStatus, ReportDetail } from "../../_types/report-detail";
import ScoreGauge from "./score-gauge";
import AiFeedback from "./ai-feedback";
import MetricsList from "./metrics-list";
import { Button } from "@/components/button/button";
import { AlertCircle, MoveRight } from "lucide-react";

interface FeedbackSectionProps {
  attempt: number;
  status: AnalysisStatus;
  data: ReportDetail;
}

function FeedbackSection({ attempt, status, data }: FeedbackSectionProps) {
  if (status === "PENDING") {
    return (
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-9 transition-all duration-300">
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <div className="w-14 h-14 border-4 border-[#4FD1C5] border-t-transparent rounded-full animate-spin" />

          <div className="text-center">
            <h2 className="font-bold text-slate-900 mb-3">
              답변을 분석하고 있습니다
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI 면접관이 5가지 핵심 지표를 기반으로 채점 중 입니다.
            </p>
            <p className="text-sm text-slate-500">
              잠시만 기다려주세요. (약 5~10초 소요)
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (status === "FAILED") {
    return (
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-9 transition-all duration-300">
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <div className="text-center">
            <h2 className="font-bold text-slate-900 mb-3">
              분석에 실패했습니다
            </h2>
            <p className="text-sm text-slate-500">
              오디오 파일 형식이 손상되어 분석할 수 없습니다.
            </p>
          </div>

          <Button
            variant="default"
            className="mt-2 px-5 py-4 font-semibold bg-[#4FD1C5] hover:bg-[#3DBFB3] text-white"
          >
            <MoveRight />
            다시 시도하기
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-[#E2E8F0] p-9 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-xs font-extrabold text-zinc-400 tracking-widest uppercase mb-1">
            TRIAL #{attempt}
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900">분석 리포트</h2>
          <div className="text-xs text-zinc-400">{data.date} 완료</div>
        </div>

        <ScoreGauge score={data.totalScore ?? 0} />
      </div>

      {data.feedback && <AiFeedback feedback={data.feedback.feedbackMessage} />}

      <MetricsList feedback={data.feedback} isPending={false} />
    </section>
  );
}

export default FeedbackSection;
