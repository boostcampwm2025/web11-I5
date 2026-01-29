"use client";

import { logger } from "@/lib/sentry-logger";
import * as React from "react";
import { useRouter } from "next/navigation";
import { checkReportProcessingStatus } from "../_lib/services/status-check";

interface ReportRefreshProps {
  pendingSubmissionIds: number[];
}

function ReportRefresh({ pendingSubmissionIds }: ReportRefreshProps) {
  const router = useRouter();
  const dependencyKey = JSON.stringify(pendingSubmissionIds);

  React.useEffect(() => {
    if (pendingSubmissionIds.length === 0) return;

    async function checkStatusAndRefresh() {
      try {
        const results = await Promise.all(
          pendingSubmissionIds.map((id) => checkReportProcessingStatus(id)),
        );

        // 하나라도 PROCESSING이 아니게 되면 (완료 또는 실패) 새로고침 실행
        if (results.some((result) => result.status !== "PROCESSING")) {
          router.refresh();
        }
      } catch (error) {
        logger.error("ReportRefresh 상태 확인 실패", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const intervalId = setInterval(checkStatusAndRefresh, 2000);

    // 최초 1회 즉시 실행
    checkStatusAndRefresh();

    return () => clearInterval(intervalId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey, router]);

  return null;
}

export default ReportRefresh;
