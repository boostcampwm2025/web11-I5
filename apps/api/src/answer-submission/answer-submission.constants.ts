const QuizMode = {
  DAILY: 'DAILY',
  INTERVIEW: 'INTERVIEW',
} as const;
type QuizMode = (typeof QuizMode)[keyof typeof QuizMode];

const InputType = {
  VOICE: 'VOICE',
  TEXT: 'TEXT',
} as const;
type InputType = (typeof InputType)[keyof typeof InputType];

const ProcessStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  FAILED: 'FAILED',
} as const;
type ProcessStatus = (typeof ProcessStatus)[keyof typeof ProcessStatus];

export { QuizMode, InputType, ProcessStatus };
