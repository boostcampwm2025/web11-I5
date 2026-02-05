import { categoryHandlers } from "./category-handlers";
import { questionHandlers } from "./question-handlers";
import { submissionHandlers } from "./submission-handlers";
import { evaluationHandlers } from "./evaluation-handlers";

export const handlers = [
  ...categoryHandlers,
  ...questionHandlers,
  ...submissionHandlers,
  ...evaluationHandlers,
];
