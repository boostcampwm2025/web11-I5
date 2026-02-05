"use client";

import * as React from "react";
import {
  ReportHistoryItem,
  ReportDetail,
  AnalysisStatus,
} from "../_types/report-detail";
import { Question } from "@/app/daily/questions/_types/types";
import type { GraphData } from "@/app/mypage/_types/graph-view";

type ReportQuestion = Question & {
  categoryDisplay: string;
  subCategory: string;
};

interface ReportStatusContextValue {
  history: ReportHistoryItem[];
  evaluations: Map<number, ReportDetail>;
  graphs: Map<number, GraphData | null>;
  question: ReportQuestion;
  selectedSubmissionId: number;
  updateSubmissionStatus: (id: number, status: AnalysisStatus) => void;
  setEvaluation: (id: number, evaluation: ReportDetail) => void;
  setGraph: (id: number, graph: GraphData | null) => void;
}

const ReportStatusContext = React.createContext<
  ReportStatusContextValue | undefined
>(undefined);

interface ReportStatusProviderProps {
  children: React.ReactNode;
  initialHistory: ReportHistoryItem[];
  initialEvaluation: ReportDetail;
  initialGraph: GraphData | null;
  selectedSubmissionId: number;
  question: ReportQuestion;
}

export function ReportStatusProvider({
  children,
  initialHistory,
  initialEvaluation,
  initialGraph,
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
  const [graphs, setGraphs] = React.useState<Map<number, GraphData | null>>(
    () => {
      const map = new Map();
      map.set(initialSelectedSubmissionId, initialGraph);
      return map;
    },
  );

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

    // 새로운 graph를 Map에 추가
    setGraphs((prev) => {
      if (prev.has(initialSelectedSubmissionId)) {
        return prev;
      }
      const next = new Map(prev);
      next.set(initialSelectedSubmissionId, initialGraph);
      return next;
    });
  }, [initialSelectedSubmissionId, initialEvaluation, initialGraph]);

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

  const setGraph = React.useCallback((id: number, graph: GraphData | null) => {
    setGraphs((prev) => {
      const next = new Map(prev);
      next.set(id, graph);
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      history,
      evaluations,
      graphs,
      question,
      selectedSubmissionId,
      updateSubmissionStatus,
      setEvaluation,
      setGraph,
    }),
    [
      history,
      evaluations,
      graphs,
      question,
      selectedSubmissionId,
      updateSubmissionStatus,
      setEvaluation,
      setGraph,
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
