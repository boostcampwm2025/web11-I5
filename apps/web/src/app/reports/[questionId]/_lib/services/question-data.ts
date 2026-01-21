import { getQuestion } from "@/app/daily/questions/[questionId]/_lib/question-api";

async function getReportQuestion(questionId: string) {
  const question = await getQuestion(questionId);

  if (!question) {
    throw new Error(`질문 데이터가 존재하지 않습니다. (id=${questionId})`);
  }

  return {
    ...question,
    categoryDisplay: question.category?.parent?.name,
    subCategory: question.category?.name,
  };
}

export { getReportQuestion };
