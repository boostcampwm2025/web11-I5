export const CoreConceptEval = {
  CORRECT: 'CORRECT', // 개념 자체가 정확
  MINOR_ERROR: 'MINOR_ERROR', // 용어 혼동, 작은 실수
  WRONG: 'WRONG', // 개념 자체가 틀림
} as const;
export type CoreConceptEval =
  (typeof CoreConceptEval)[keyof typeof CoreConceptEval];

export const CoverageEval = {
  COMPLETE: 'COMPLETE', // 모범답안의 주요 포인트 대부분 언급
  ADEQUATE: 'ADEQUATE', // 핵심만 언급
  MINIMAL: 'MINIMAL', // 최소한만
} as const;
export type CoverageEval = (typeof CoverageEval)[keyof typeof CoverageEval];

export const LogicEval = {
  CLEAR: 'CLEAR',
  WEAK: 'WEAK',
  NONE: 'NONE',
} as const;
export type LogicEval = (typeof LogicEval)[keyof typeof LogicEval];

export const DepthEval = {
  ADVANCED: 'ADVANCED', // 원리/이유/비교/적용 중 2개 이상
  BASIC: 'BASIC', // 정의 + 하나의 요소
  NONE: 'NONE', // 정의만
} as const;
export type DepthEval = (typeof DepthEval)[keyof typeof DepthEval];

export const EvaluationStatus = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
} as const;
export type EvaluationStatus =
  (typeof EvaluationStatus)[keyof typeof EvaluationStatus];
