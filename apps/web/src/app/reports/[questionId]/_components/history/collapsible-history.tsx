"use client";

import * as React from "react";
import { ChevronRight, History } from "lucide-react";
import { Button } from "@/components/button/button";
import { ReportHistoryItem } from "../../_types/report-detail";
import HistoryItem from "./history-item";

interface CollapsibleHistoryProps {
  history: ReportHistoryItem[];
  selectedId: number;
}

function CollapsibleHistory({ history, selectedId }: CollapsibleHistoryProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // 화면 크기에 따라 초기 상태 설정
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    setIsOpen(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsOpen(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 모바일에서 사이드바 열렸을 때 body 스크롤 잠금
  React.useEffect(() => {
    const isLg = window.matchMedia("(min-width: 1024px)").matches;
    if (isOpen && !isLg) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* 모바일 토글 버튼 - 더 눈에 띄게 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed right-0 top-20 z-40 flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white pl-3 pr-2 py-3 rounded-l-xl shadow-lg transition-all hover:pr-3 group"
          aria-label="시도 히스토리 열기"
        >
          <History className="w-4 h-4" />
          <span className="text-sm font-semibold whitespace-nowrap">
            히스토리
          </span>
          <span className="bg-white text-teal-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
            {history.length}
          </span>
        </button>
      )}

      {/* 모바일 백드롭 */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 히스토리 사이드바 */}
      <div
        className={`
          fixed lg:sticky top-16 lg:top-22 right-0 z-40 lg:z-auto
          h-[calc(100vh-4rem)] lg:h-fit lg:max-h-[calc(100vh-10rem)] lg:self-start
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          ${!isOpen && "lg:hidden"}
        `}
      >
        <div className="w-64 lg:w-60 h-full lg:h-fit lg:max-h-[calc(100vh-10rem)] flex flex-col bg-white rounded-l-2xl lg:rounded-2xl border border-slate-200 shadow-lg lg:shadow-none">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-500" />
              <span className="font-bold text-sm text-slate-900">
                시도 히스토리
              </span>
              <span className="bg-teal-50 text-teal-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {history.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="lg:hidden -mr-2 h-8 w-8"
              aria-label="닫기"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.map((item) => (
              <HistoryItem
                key={item.submissionId}
                index={item.displayIndex}
                item={item}
                isSelected={selectedId === item.submissionId}
                href={`?attempt=${item.submissionId}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default CollapsibleHistory;
