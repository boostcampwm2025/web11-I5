"use client";

import * as React from "react";
import {
  ReportHistoryItem,
  ReportDetail,
  AnalysisStatus,
} from "../_types/report-detail";
import { Question } from "@/app/daily/questions/_types/types";

type ReportQuestion = Question & {
  categoryDisplay: string;
  subCategory: string;
};

interface ReportStatusContextValue {
  history: ReportHistoryItem[];
  evaluations: Map<number, ReportDetail>;
  question: ReportQuestion;
  selectedSubmissionId: number;
  updateSubmissionStatus: (id: number, status: AnalysisStatus) => void;
  setEvaluation: (id: number, evaluation: ReportDetail) => void;
}

const ReportStatusContext = React.createContext<
  ReportStatusContextValue | undefined
>(undefined);

interface ReportStatusProviderProps {
  children: React.ReactNode;
  initialHistory: ReportHistoryItem[];
  initialEvaluation: ReportDetail;
  selectedSubmissionId: number;
  question: ReportQuestion;
}

export function ReportStatusProvider({
  children,
  initialHistory,
  initialEvaluation,
  selectedSubmissionId: initialSelectedSubmissionId,
  question,
}: ReportStatusProviderProps) {
  const [history, setHistory] = React.useState(initialHistory);
  const [selectedSubmissionId, setSelectedSubmissionId] = React.useState(
    initialSelectedSubmissionId,
  );
  const [evaluations, setEvaluations] = React.useState<
    Map<number, ReportDetail>
  >(() => {
    const map = new Map();
    map.set(initialSelectedSubmissionId, initialEvaluation);
    return map;
  });

  // URL에서 selectedSubmissionId가 변경되면 Context state 업데이트
  React.useEffect(() => {
    setSelectedSubmissionId(initialSelectedSubmissionId);

    // 새로운 evaluation을 Map에 추가
    setEvaluations((prev) => {
      if (prev.has(initialSelectedSubmissionId)) {
        return prev;
      }
      const next = new Map(prev);
      next.set(initialSelectedSubmissionId, initialEvaluation);
      return next;
    });
  }, [initialSelectedSubmissionId, initialEvaluation]);

  const updateSubmissionStatus = React.useCallback(
    (id: number, status: AnalysisStatus) => {
      setHistory((prev) =>
        prev.map((item) =>
          item.submissionId === id ? { ...item, status } : item,
        ),
      );
    },
    [],
  );

  const setEvaluation = React.useCallback(
    (id: number, evaluation: ReportDetail) => {
      setEvaluations((prev) => {
        const next = new Map(prev);
        next.set(id, evaluation);
        return next;
      });
    },
    [],
  );

  const value = React.useMemo(
    () => ({
      history,
      evaluations,
      question,
      selectedSubmissionId,
      updateSubmissionStatus,
      setEvaluation,
    }),
    [
      history,
      evaluations,
      question,
      selectedSubmissionId,
      updateSubmissionStatus,
      setEvaluation,
    ],
  );

  return (
    <ReportStatusContext.Provider value={value}>
      {children}
    </ReportStatusContext.Provider>
  );
}

export function useReportStatus() {
  const context = React.useContext(ReportStatusContext);
  if (context === undefined) {
    throw new Error(
      "저장된 context가 없습니다. ReportStatusProvider로 감싸져 있는지 확인해주세요.",
    );
  }
  return context;
}
