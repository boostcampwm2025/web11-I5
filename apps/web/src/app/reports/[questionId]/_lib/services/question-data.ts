import { getQuestion } from "@/app/daily/questions/[questionId]/_lib/question-api";
import { mapToCategoryDisplay } from "../mapper/mapper";

async function getReportQuestion(questionId: string) {
  const question = await getQuestion(questionId);

  if (!question) {
    throw new Error(`질문 데이터가 존재하지 않습니다. (id=${questionId})`);
  }

  const { category, subCategory } = mapToCategoryDisplay(question);

  return {
    ...question,
    categoryDisplay: category,
    subCategory: subCategory ?? "",
  };
}

export { getReportQuestion };
