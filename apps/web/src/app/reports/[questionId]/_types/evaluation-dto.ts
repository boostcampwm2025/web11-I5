export type CoreConceptEval = "CORRECT" | "MINOR_ERROR" | "WRONG";
export type CoverageEval = "COMPLETE" | "ADEQUATE" | "MINIMAL";
export type LogicEval = "CLEAR" | "WEAK" | "NONE";
export type DepthEval = "ADVANCED" | "BASIC" | "NONE";

export interface EvaluationDTO {
  id: number;
  submissionId: number;
  feedbackMessage: string;
  coreConceptEval: CoreConceptEval;
  coverageEval: CoverageEval;
  logicEval: LogicEval;
  depthEval: DepthEval;

  detailAnalysis: {
    coreConcept: string;
    coverage: string;
    logic: string;
    depth: string;
  };

  scoreDetails: {
    coreConcept: number;
    coverage: number;
    logic: number;
    depth: number;
  };

  extractedKeywords: string[];
  createdAt: string;
}
