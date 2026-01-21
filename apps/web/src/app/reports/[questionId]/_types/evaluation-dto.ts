export type AccuracyEval = "PERFECT" | "GOOD" | "MIXED" | "WRONG";
export type LogicEval = "FLAWLESS" | "COHERENT" | "WEAK" | "NONE";
export type DepthEval = "EXPERT" | "ADVANCED" | "BASIC" | "NONE";

export interface EvaluationDTO {
  id: number;
  submissionId: number;
  feedbackMessage: string;
  accuracyEval: AccuracyEval;
  logicEval: LogicEval;
  depthEval: DepthEval;

  detailAnalysis: {
    accuracy: string;
    logic: string;
    depth: string;
  };

  scoreDetails: {
    accuracy: number;
    logic: number;
    depth: number;
  };

  extractedKeywords: string[];
  createdAt: string;
}
