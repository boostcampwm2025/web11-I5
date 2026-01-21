"use server";

import { fetchSubmissionById } from "../fetch/fetch-submission";

export interface ProcessingStatus {
  status: "PROCESSING" | "FAILED" | "COMPLETED";
  step?: "STT" | "EVALUATION";
  message?: string;
}

async function checkReportProcessingStatus(
  submissionId: number,
): Promise<ProcessingStatus> {
  const submission = await fetchSubmissionById(submissionId);

  if (!submission) {
    return {
      status: "FAILED",
      message: "존재하지 않는 제출 내역입니다.",
    };
  }

  if (
    submission.sttStatus === "PENDING" ||
    submission.sttStatus === "IN_PROGRESS"
  ) {
    return {
      status: "PROCESSING",
      step: "STT",
      message: "음성을 텍스트로 변환 중입니다...",
    };
  }

  if (submission.sttStatus === "FAILED") {
    return {
      status: "FAILED",
      step: "STT",
      message: "음성 인식(STT)에 실패했습니다.",
    };
  }

  if (submission.evaluationStatus === "PENDING") {
    return {
      status: "PROCESSING",
      step: "EVALUATION",
      message: "AI가 답변을 채점 중입니다...",
    };
  }

  if (submission.evaluationStatus === "FAILED") {
    return {
      status: "FAILED",
      step: "EVALUATION",
      message: "답변 채점 중 오류가 발생했습니다.",
    };
  }

  return {
    status: "COMPLETED",
  };
}

export { checkReportProcessingStatus };
