"use client";

import * as React from "react";
import { fetchBatchReportProcessingStatus } from "../_lib/fetch/fetch-batch-status";
import { useReportStatus } from "../_context/report-status-context";
import { getReportEvaluation } from "../_lib/services/evaluation-data";
import { getReportGraph } from "../_lib/services/graph-data";
import { ReportHistoryItem } from "../_types/report-detail";

function ReportRefresh() {
  const {
    history,
    evaluations,
    graphs,
    updateSubmissionStatus,
    setEvaluation,
    setGraph,
  } = useReportStatus();

  // Context에서 PENDING 상태인 submission ID들 추출
  const pendingSubmissionIds = React.useMemo(
    () =>
      history.filter((h) => h.status === "PENDING").map((h) => h.submissionId),
    [history],
  );

  const MAX_POLLING_ATTEMPTS = 126;
  const completedIdsRef = React.useRef<Set<number>>(new Set());

  const refs = React.useRef({
    history,
    updateSubmissionStatus,
    setEvaluation,
    setGraph,
    evaluations,
    graphs,
    pendingSubmissionIds,
  });

  React.useEffect(() => {
    refs.current = {
      history,
      updateSubmissionStatus,
      setEvaluation,
      setGraph,
      evaluations,
      graphs,
      pendingSubmissionIds,
    };
  }, [
    history,
    updateSubmissionStatus,
    setEvaluation,
    setGraph,
    evaluations,
    graphs,
    pendingSubmissionIds,
  ]);

  const getPollingInterval = (attemptCount: number) => {
    if (attemptCount < 60) return 2000; // 0-2분: 2초 간격
    if (attemptCount < 96) return 5000; // 2-5분: 5초 간격
    return 10000; // 5-10분: 10초 간격
  };

  // Polling 로직
  React.useEffect(() => {
    let isCancelled = false;
    let attemptCount = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    const processingIds = new Set<number>();

    const fetchAndApplyData = async (
      id: number,
      status: "COMPLETED" | "FAILED",
    ) => {
      try {
        if (isCancelled) return false;

        if (status === "FAILED") {
          refs.current.updateSubmissionStatus(id, "FAILED");
          return true;
        }

        // 이미 완료된 데이터가 존재하는지 확인 (불필요한 중복 페치 방지)
        const existingEval = refs.current.evaluations.get(id);
        const hasFullData =
          existingEval?.status === "COMPLETED" && refs.current.graphs.has(id);

        if (hasFullData) {
          // 데이터는 있는데 상태만 PENDING인 경우 상태만 업데이트
          const currentItem = (
            refs.current.history as ReportHistoryItem[]
          ).find((h) => h.submissionId === id);
          if (currentItem && currentItem.status === "PENDING") {
            refs.current.updateSubmissionStatus(id, "COMPLETED");
          }
          return true;
        }

        // 데이터 조회 시작
        const [evaluation, graph] = await Promise.all([
          getReportEvaluation(id),
          getReportGraph(id),
        ]);

        if (isCancelled) return false;

        // 데이터가 아직 준비되지 않았거나 status가 여전히 PENDING인 경우
        if (!evaluation || evaluation.status !== "COMPLETED") {
          return false;
        }

        // 데이터 먼저 업데이트 후, 마지막에 상태 전환
        refs.current.setEvaluation(id, evaluation);
        refs.current.setGraph(id, graph);
        refs.current.updateSubmissionStatus(id, "COMPLETED");

        return true;
      } catch (error) {
        console.error(`[ReportRefresh] ID ${id} 데이터 페치 에러:`, error);
        return false;
      }
    };

    const poll = async () => {
      if (isCancelled) return;

      if (attemptCount >= MAX_POLLING_ATTEMPTS) {
        return;
      }

      const idsToCheck = refs.current.pendingSubmissionIds.filter(
        (id) => !completedIdsRef.current.has(id) && !processingIds.has(id),
      );

      if (idsToCheck.length === 0) {
        attemptCount += 1;
        const nextInterval = getPollingInterval(attemptCount);
        timeoutId = setTimeout(() => {
          poll();
        }, nextInterval);
        return;
      }

      try {
        const results = await fetchBatchReportProcessingStatus(idsToCheck);
        if (isCancelled) return;

        // 상태가 변한 ID들에 대해 데이터 페치 수행
        await Promise.all(
          idsToCheck.map(async (id) => {
            const result = results[id];
            if (!result || result.status === "PROCESSING") return;

            processingIds.add(id);
            const success = await fetchAndApplyData(id, result.status);
            processingIds.delete(id);

            if (success) {
              completedIdsRef.current.add(id);
            }
          }),
        );
      } catch (error) {
        console.error("[ReportRefresh] polling 에러:", error);
      }

      if (isCancelled) return;

      // 다음 체크 스케줄
      attemptCount += 1;
      const nextInterval = getPollingInterval(attemptCount);
      timeoutId = setTimeout(() => {
        poll();
      }, nextInterval);
    };

    // 초기 실행
    poll();

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // mount 시에만 단일 polling loop 보장

  return null;
}

export default ReportRefresh;
