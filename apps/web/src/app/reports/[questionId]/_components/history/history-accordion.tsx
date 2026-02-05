"use client";

import * as React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import Link from "next/link";
import { AlertCircle, ChevronDown, History } from "lucide-react";
import { Spinner } from "@/components/spinner/spinner";
import { ReportHistoryItem } from "../../_types/report-detail";
import useMediaQuery from "@/hooks/use-media-query";
import { useReportStatus } from "../../_context/report-status-context";

function HistoryAccordion() {
  const { history, evaluations, selectedSubmissionId } = useReportStatus();

  const is5xlUp = useMediaQuery("(min-width: 1280px)");
  const [openValue, setOpenValue] = React.useState<"" | "history">("");

  React.useEffect(() => {
    setOpenValue(is5xlUp ? "history" : "");
  }, [is5xlUp]);

  const renderStatus = (item: ReportHistoryItem) => {
    const evaluation = evaluations.get(item.submissionId);
    const totalScore = evaluation?.totalScore ?? item.totalScore;

    switch (item.status) {
      case "COMPLETED":
        return (
          <span className="text-sm font-bold text-slate-700">
            {totalScore == null ? "점수 없음" : `${totalScore}점`}
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Spinner className="w-3 h-3" aria-hidden />
            분석 중
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center gap-1 text-xs text-rose-500">
            <AlertCircle className="w-3 h-3" aria-hidden />
            실패
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Accordion.Root
      type="single"
      collapsible
      className="bg-white border border-gray-200 rounded-xl overflow-hidden"
      value={openValue}
      onValueChange={(v) => setOpenValue((v as "" | "history") ?? "")}
    >
      <Accordion.Item value="history">
        {/* 헤더 (토글 버튼) */}
        <Accordion.Header>
          <Accordion.Trigger className="group w-full px-5 py-4 md:px-6 md:py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-teal-500" aria-hidden="true" />
              <span className="text-sm md:text-base font-bold text-slate-800">
                내 제출
              </span>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            </div>
            <ChevronDown
              className="w-5 h-5 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </Accordion.Trigger>
        </Accordion.Header>

        {/* 콘텐츠 (시도 목록) */}
        <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="border-t border-gray-100 px-4 py-3 md:px-5 md:py-4 space-y-2 overflow-y-auto max-h-96">
            {history.map((item) => {
              const isSelected = item.submissionId === selectedSubmissionId;

              return (
                <Link
                  key={item.submissionId}
                  href={`?attempt=${item.submissionId}`}
                  scroll={false}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-teal-50 ring-1 ring-teal-200"
                      : "bg-slate-50/50 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* 왼쪽: Trial 번호 + 날짜 */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`text-sm font-bold whitespace-nowrap ${
                          isSelected ? "text-teal-600" : "text-slate-700"
                        }`}
                      >
                        TRIAL #{item.displayIndex}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {item.date.split(" ")[0]}
                      </span>
                    </div>

                    {/* 오른쪽: 점수 + 변화량 */}
                    <div className="flex items-center gap-2 shrink-0">
                      {renderStatus(item)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

export default HistoryAccordion;
