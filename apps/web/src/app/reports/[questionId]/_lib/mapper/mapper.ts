import { EvaluationDTO } from "../../_types/evaluation-dto";
import { ReportDetail, ReportHistoryItem } from "../../_types/report-detail";
import { SubmissionDTO } from "../../_types/submission-dto";

function formatDateTimeKST(isoString: string): string {
  const d = new Date(isoString);

  const kstFormatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = kstFormatter.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function mapToReportDetail(
  submission: SubmissionDTO,
  evaluation?: EvaluationDTO,
): ReportDetail {
  const base = {
    submissionId: submission.id,
    questionId: submission.questionId,
    date: formatDateTimeKST(submission.submittedAt),
    duration: formatDuration(submission.duration),
    answerContent: submission.answerContent,
    sttStatus: submission.sttStatus,
    evaluationStatus: submission.evaluationStatus,
  };

  // STT 실패 -> 다시 도전하기 필요
  if (submission.sttStatus === "FAILED") {
    return {
      ...base,
      status: "FAILED",
      totalScore: null,
    };
  }

  // STT 또는 Evaluation이 아직 진행 중
  if (
    submission.sttStatus === "PENDING" ||
    submission.sttStatus === "IN_PROGRESS" ||
    submission.evaluationStatus === "PENDING"
  ) {
    return {
      ...base,
      status: "PENDING",
      totalScore: null,
    };
  }

  // Evaluation 실패 -> 채점 다시하기 필요
  if (submission.evaluationStatus === "FAILED") {
    return {
      ...base,
      status: "FAILED",
      totalScore: null,
    };
  }

  // Evaluation 완료됐는데 데이터가 없는 경우
  if (!evaluation) {
    return {
      ...base,
      status: "FAILED",
      totalScore: null,
    };
  }

  return {
    ...base,
    status: "COMPLETED",
    totalScore: submission.totalScore ?? 0,
    feedback: {
      feedbackMessage: evaluation.feedbackMessage,
      accuracyReason: evaluation.detailAnalysis.accuracy,
      logicReason: evaluation.detailAnalysis.logic,
      depthReason: evaluation.detailAnalysis.depth,
      scoreDetails: evaluation.scoreDetails,
      extractedKeywords: evaluation.extractedKeywords ?? [],
    },
  };
}

function mapToReportHistoryItem(
  submission: SubmissionDTO,
  displayIndex: number,
): ReportHistoryItem {
  const unifiedStatus: "PENDING" | "COMPLETED" | "FAILED" = (() => {
    // 하나라도 실패하면 최종 상태는 FAILED
    if (
      submission.sttStatus === "FAILED" ||
      submission.evaluationStatus === "FAILED"
    ) {
      return "FAILED";
    }
    // 하나라도 진행 중이면 최종 상태는 PENDING
    if (
      submission.sttStatus === "PENDING" ||
      submission.sttStatus === "IN_PROGRESS" ||
      submission.evaluationStatus === "PENDING"
    ) {
      return "PENDING";
    }

    // 둘 다 완료된 경우에만 COMPLETED
    if (
      submission.sttStatus === "DONE" &&
      submission.evaluationStatus === "COMPLETED"
    ) {
      return "COMPLETED";
    }

    return "PENDING";
  })();

  return {
    submissionId: submission.id,
    questionId: submission.questionId,
    date: formatDateTimeKST(submission.submittedAt),
    duration: formatDuration(submission.duration),
    answerContent: submission.answerContent,
    status: unifiedStatus,
    sttStatus: submission.sttStatus,
    evaluationStatus: submission.evaluationStatus,
    totalScore:
      submission.evaluationStatus === "COMPLETED"
        ? submission.totalScore
        : null,
    displayIndex,
  };
}

export { mapToReportDetail, mapToReportHistoryItem };
