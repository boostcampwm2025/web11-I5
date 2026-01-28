import { getReportEvaluation } from "./evaluation-data";
import { getReportHistory } from "./history-data";
import { getReportQuestion } from "./question-data";

async function getReportPageData(questionId: number, submissionId?: number) {
  const [question, history] = await Promise.all([
    getReportQuestion(String(questionId)),
    getReportHistory(questionId),
  ]);

  const selectedSubmissionId = submissionId ?? history.at(-1)?.submissionId;

  const evaluation = selectedSubmissionId
    ? await getReportEvaluation(selectedSubmissionId)
    : null;

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
  };
}

export { getReportPageData };
