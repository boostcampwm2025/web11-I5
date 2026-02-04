import { getReportEvaluation } from "./evaluation-data";
import { getReportGraph, getReportFullGraph } from "./graph-data";
import { getReportHistory } from "./history-data";
import { getReportQuestion } from "./question-data";

async function getReportPageData(questionId: number, submissionId?: number) {
  const [question, history] = await Promise.all([
    getReportQuestion(String(questionId)),
    getReportHistory(questionId),
  ]);

  const selectedSubmissionId = submissionId ?? history.at(-1)?.submissionId;

  const [evaluation, submissionGraph, fullGraph] = await Promise.all([
    selectedSubmissionId
      ? getReportEvaluation(selectedSubmissionId)
      : Promise.resolve(null),
    selectedSubmissionId
      ? getReportGraph(selectedSubmissionId)
      : Promise.resolve(null),
    getReportFullGraph(),
  ]);

  // 전체 사용자 그래프를 사용 (모든 문제에서 추출된 키워드로 만든 그래프)
  const fullGraphForQuestion = fullGraph;

  const highestScore = Math.max(
    ...history
      .map((h) => h.totalScore)
      .filter((score): score is number => score !== null),
    0,
  );

  return {
    question,
    history,
    evaluation,
    highestScore,
    submissionGraph,
    fullGraphForQuestion,
  };
}

export { getReportPageData };
