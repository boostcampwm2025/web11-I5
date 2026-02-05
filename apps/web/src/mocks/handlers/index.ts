import { categoryHandlers } from "./category-handlers";
import { questionHandlers } from "./question-handlers";
import { authHandlers } from "./auth-handlers";
import { submissionHandlers } from "./submission-handlers";
import { evaluationHandlers } from "./evaluation-handlers";

export const handlers = [
  ...categoryHandlers,
  ...questionHandlers,
  ...authHandlers,
  ...submissionHandlers,
  ...evaluationHandlers,
];
