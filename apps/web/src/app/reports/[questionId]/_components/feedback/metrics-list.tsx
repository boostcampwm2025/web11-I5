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
      <div className="space-y-4 md:space-y-6 animate-pulse">
        <div className="mb-3 md:mb-4">
          <div className="h-4 md:h-5 w-28 md:w-32 bg-slate-100 rounded mb-2" />
          <div className="h-3 w-36 md:w-40 bg-slate-50 rounded" />
        </div>
        <div className="flex flex-col gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 md:h-24 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  const coreMetrics = [
    {
      label: "핵심 개념",
      score: feedback.scoreDetails.coreConcept,
      max: 50,
      reason: feedback.coreConceptReason,
    },
    {
      label: "완성도",
      score: feedback.scoreDetails.coverage,
      max: 20,
      reason: feedback.coverageReason,
    },
    {
      label: "심층성",
      score: feedback.scoreDetails.depth,
      max: 20,
      reason: feedback.depthReason,
    },
    {
      label: "논리성",
      score: feedback.scoreDetails.logic,
      max: 10,
      reason: feedback.logicReason,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="mb-3 md:mb-4">
        <h3 className="font-bold text-lg md:text-xl mb-0.5">
          성취도 상세 분석
        </h3>
        <span className="text-sm md:text-base text-muted-foreground">
          항목별 평가 상세 내역입니다
        </span>
      </div>

      <Accordion.Root type="multiple" className="flex flex-col gap-3 md:gap-4">
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
    </div>
  );
}

export default MetricsList;
