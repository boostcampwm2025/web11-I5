import { categoryHandlers } from "./category-handlers";
import { questionHandlers } from "./question-handlers";

export const handlers = [...categoryHandlers, ...questionHandlers];
