export type AccuracyEval = "PERFECT" | "GOOD" | "POOR";
export type LogicEval = "CLEAR" | "AVERAGE" | "CONFUSING";
export type DepthEval = "DEEP" | "BASIC" | "SHALLOW";

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
    completeness: number;
    application: number;
  };

  hasApplication: boolean;
  isCompleteSentence: boolean;
  extractedKeywords: string[];

  createdAt: string;
}
