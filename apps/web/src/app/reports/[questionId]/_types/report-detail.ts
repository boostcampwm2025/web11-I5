export type AnalysisStatus = "COMPLETED" | "PENDING" | "FAILED";
export type STTStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
export type EvaluationStatus = AnalysisStatus;

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
  sttStatus: STTStatus;
  evaluationStatus: EvaluationStatus;
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
