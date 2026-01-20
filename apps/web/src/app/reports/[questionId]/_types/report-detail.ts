export type AnalysisStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface FeedbackResult {
  feedbackMessage: string;
  accuracyReason: string;
  logicReason: string;
  depthReason: string;
  scoreDetails: {
    accuracy: number;
    logic: number;
    depth: number;
    completeness: number;
    application: number;
  };
  extractedKeywords: string[];
}

export interface BaseReportDetail {
  submissionId: number;
  questionId: number;
  date: string;
  duration: string;
  answerContent: string;
  status: AnalysisStatus;
}

export interface PendingReportDetail extends BaseReportDetail {
  status: "PENDING";
  totalScore: null;
  feedback?: never;
}

export interface FailedReportDetail extends BaseReportDetail {
  status: "FAILED";
  totalScore: null;
  feedback?: never;
  reason?: string;
}

export interface SuccessReportDetail extends BaseReportDetail {
  status: "COMPLETED";
  totalScore: number;
  feedback: FeedbackResult;
}

export type ReportDetail =
  | PendingReportDetail
  | FailedReportDetail
  | SuccessReportDetail;

export interface ReportHistoryItem extends BaseReportDetail {
  totalScore: number | null;
  displayIndex: number;
}
