import type {
  EvaluationStatus,
  STTStatus,
  InputType,
  ScoreDetails,
} from "@repo/types";

export type AnalysisStatus = EvaluationStatus;
export type { STTStatus, InputType, EvaluationStatus };

export interface FeedbackResult {
  feedbackMessage: string;
  coreConceptReason: string;
  coverageReason: string;
  logicReason: string;
  depthReason: string;
  scoreDetails: ScoreDetails;
  extractedKeywords: string[];
}

export interface BaseReportDetail {
  submissionId: number;
  inputType: InputType;
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
