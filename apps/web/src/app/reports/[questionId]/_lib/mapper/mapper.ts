import { Question } from "@/app/daily/questions/_types/types";
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
  };

  if (submission.evaluationStatus === "PENDING") {
    return {
      ...base,
      status: "PENDING",
      totalScore: null,
    };
  }

  if (submission.evaluationStatus === "FAILED") {
    return {
      ...base,
      status: "FAILED",
      totalScore: null,
      reason: "채점 처리 중 오류가 발생했습니다.",
    };
  }

  if (!evaluation) {
    throw new Error(
      `채점 완료된 답변은 채점 기록이 있어야 합니다.(id=${submission.id})`,
    );
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
    totalScore:
      submission.evaluationStatus === "COMPLETED"
        ? submission.totalScore
        : null,
    displayIndex,
  };
}

function mapToCategoryDisplay(question: Question) {
  const cat = question.category;

  if (!cat) {
    return { category: "미분류", subCategory: "" };
  }

  if (!cat.children || cat.children.length === 0) {
    return {
      category: cat.name,
      subCategory: "",
    };
  }

  return {
    category: cat.name ?? "상위 카테고리",
    subCategory: cat.children[0].name ?? "",
  };
}

export { mapToReportDetail, mapToReportHistoryItem, mapToCategoryDisplay };
