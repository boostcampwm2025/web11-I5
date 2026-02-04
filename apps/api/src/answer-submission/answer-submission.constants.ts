import { InputType, ProcessStatus } from '@repo/types';

const QuizMode = {
  DAILY: 'DAILY',
  INTERVIEW: 'INTERVIEW',
} as const;
type QuizMode = (typeof QuizMode)[keyof typeof QuizMode];

export { QuizMode, InputType, ProcessStatus };
