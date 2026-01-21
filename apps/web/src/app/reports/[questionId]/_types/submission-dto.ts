import { AnalysisStatus } from "./report-detail";

export type STTStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
export type InputType = "TEXT" | "VOICE";

export interface SubmissionDTO {
  id: number;
  questionId: number;
  submittedAt: string;
  duration: number;
  answerContent: string;
  evaluationStatus: AnalysisStatus;
  sttStatus: STTStatus;
  inputType: InputType;
  totalScore: number | null;
  audioAssetId: number | null;
}
