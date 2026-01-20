import * as Accordion from "@radix-ui/react-accordion";
import { FeedbackResult } from "../../_types/report-detail";
import MetricItem from "./metric-item";

interface MetricsListProps {
  feedback?: FeedbackResult;
  isPending: boolean;
}

function MetricsList({ feedback, isPending }: MetricsListProps) {
  if (isPending || !feedback) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="mb-4">
          <div className="h-5 w-32 bg-slate-100 rounded mb-2" />
          <div className="h-3 w-40 bg-slate-50 rounded" />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-50 rounded-2xl border border-slate-100"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="h-16 bg-slate-50 rounded-2xl" />
          <div className="h-16 bg-slate-50 rounded-2xl" />
        </div>
      </div>
    );
  }

  const coreMetrics = [
    {
      label: "정확성",
      score: feedback.scoreDetails.accuracy,
      max: 35,
      reason: feedback.accuracyReason,
    },
    {
      label: "논리성",
      score: feedback.scoreDetails.logic,
      max: 30,
      reason: feedback.logicReason,
    },
    {
      label: "심층성",
      score: feedback.scoreDetails.depth,
      max: 25,
      reason: feedback.depthReason,
    },
  ];

  const bonusMetrics = [
    {
      label: "문장 완성도",
      score: feedback.scoreDetails.completeness,
      max: 5,
    },
    {
      label: "실무 활용도",
      score: feedback.scoreDetails.application,
      max: 5,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="font-extrabold text-slate-900 mb-0.5">
          성취도 상세 분석
        </h3>
        <span className="text-xs text-slate-400">
          항목별 평가 상세 내역입니다
        </span>
      </div>

      <Accordion.Root type="multiple" className="flex flex-col gap-4">
        {coreMetrics.map((m) => (
          <MetricItem
            key={m.label}
            value={m.label}
            label={m.label}
            score={m.score}
            max={m.max}
            reason={m.reason}
          />
        ))}
      </Accordion.Root>

      <div className="grid grid-cols-2 gap-4 pt-2">
        {bonusMetrics.map((m) => (
          <MetricItem
            key={m.label}
            label={m.label}
            score={m.score}
            max={m.max}
          />
        ))}
      </div>
    </div>
  );
}

export default MetricsList;
