export const AccuracyEval = {
  PERFECT: 'PERFECT',
  GOOD: 'GOOD',
  MIXED: 'MIXED',
  WRONG: 'WRONG',
} as const;
export type AccuracyEval = (typeof AccuracyEval)[keyof typeof AccuracyEval];

export const LogicEval = {
  FLAWLESS: 'FLAWLESS',
  COHERENT: 'COHERENT',
  WEAK: 'WEAK',
  NONE: 'NONE',
} as const;
export type LogicEval = (typeof LogicEval)[keyof typeof LogicEval];

export const DepthEval = {
  EXPERT: 'EXPERT',
  ADVANCED: 'ADVANCED',
  BASIC: 'BASIC',
  NONE: 'NONE',
} as const;
export type DepthEval = (typeof DepthEval)[keyof typeof DepthEval];

export const EvaluationStatus = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
} as const;
export type EvaluationStatus =
  (typeof EvaluationStatus)[keyof typeof EvaluationStatus];
