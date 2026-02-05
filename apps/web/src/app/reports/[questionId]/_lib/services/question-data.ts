import { getQuestion } from "@/app/daily/questions/[questionId]/_lib/question-api";

async function getReportQuestion(questionId: string) {
  const question = await getQuestion(questionId);

  if (!question) {
    return null;
  }

  return {
    ...question,
    categoryDisplay: question.category?.parent?.name ?? "",
    subCategory: question.category?.name ?? "",
  };
}

export { getReportQuestion };
