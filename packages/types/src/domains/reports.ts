export const CoreConceptEval = {
  CORRECT: "CORRECT",
  MINOR_ERROR: "MINOR_ERROR",
  WRONG: "WRONG",
} as const;
export type CoreConceptEval =
  (typeof CoreConceptEval)[keyof typeof CoreConceptEval];

export const CoverageEval = {
  COMPLETE: "COMPLETE",
  ADEQUATE: "ADEQUATE",
  MINIMAL: "MINIMAL",
} as const;
export type CoverageEval = (typeof CoverageEval)[keyof typeof CoverageEval];

export const LogicEval = {
  CLEAR: "CLEAR",
  WEAK: "WEAK",
  NONE: "NONE",
} as const;
export type LogicEval = (typeof LogicEval)[keyof typeof LogicEval];

export const DepthEval = {
  ADVANCED: "ADVANCED",
  BASIC: "BASIC",
  NONE: "NONE",
} as const;
export type DepthEval = (typeof DepthEval)[keyof typeof DepthEval];

export const EvaluationStatus = {
  COMPLETED: "COMPLETED",
  PENDING: "PENDING",
  FAILED: "FAILED",
} as const;
export type EvaluationStatus =
  (typeof EvaluationStatus)[keyof typeof EvaluationStatus];

export const InputType = {
  VOICE: "VOICE",
  TEXT: "TEXT",
} as const;
export type InputType = (typeof InputType)[keyof typeof InputType];

export const ProcessStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  FAILED: "FAILED",
} as const;
export type ProcessStatus = (typeof ProcessStatus)[keyof typeof ProcessStatus];

export type STTStatus = ProcessStatus;

export interface ScoreDetails {
  coreConcept: number;
  coverage: number;
  logic: number;
  depth: number;
}

export interface DetailAnalysis {
  coreConcept: string;
  coverage: string;
  logic: string;
  depth: string;
}

export interface EvaluationDTO {
  id: number;
  submissionId: number;
  feedbackMessage: string;
  coreConceptEval: CoreConceptEval;
  coverageEval: CoverageEval;
  logicEval: LogicEval;
  depthEval: DepthEval;
  detailAnalysis: DetailAnalysis;
  scoreDetails: ScoreDetails;
  extractedKeywords: string[];
  createdAt: string;
}

export interface SubmissionDTO {
  id: number;
  questionId: number;
  submittedAt: string;
  duration: number;
  answerContent: string;
  evaluationStatus: EvaluationStatus;
  sttStatus: STTStatus;
  inputType: InputType;
  totalScore: number | null;
  audioAssetId: number | null;
}
