import { getReportEvaluation } from "./evaluation-data";
import {
  getReportGraph,
  getReportGraphBySubmissionIds,
  filterGraphByQuestionId,
} from "./graph-data";
import { getReportHistory } from "./history-data";
import { getReportQuestion } from "./question-data";

async function getReportPageData(questionId: number, submissionId?: number) {
  const [question, history] = await Promise.all([
    getReportQuestion(String(questionId)),
    getReportHistory(questionId),
  ]);

  const selectedSubmissionId = submissionId ?? history.at(-1)?.submissionId;

  // 선택한 제출까지의 제출 ID 목록 (시간순) → 그 시점의 그래프 모양 조회용
  const submissionIdsUpToSelected =
    selectedSubmissionId != null
      ? (() => {
          const idx = history.findIndex(
            (h) => h.submissionId === selectedSubmissionId,
          );
          if (idx < 0) return [];
          return history.slice(0, idx + 1).map((h) => h.submissionId);
        })()
      : [];

  const [evaluation, submissionGraph, cumulativeGraph] = await Promise.all([
    selectedSubmissionId
      ? getReportEvaluation(selectedSubmissionId)
      : Promise.resolve(null),
    selectedSubmissionId
      ? getReportGraph(selectedSubmissionId)
      : Promise.resolve(null),
    submissionIdsUpToSelected.length > 0
      ? getReportGraphBySubmissionIds(submissionIdsUpToSelected)
      : Promise.resolve(null),
  ]);

  // 그 시점까지의 누적 그래프에서 이 문제에 해당하는 서브그래프만 추림
  const fullGraphForQuestion =
    cumulativeGraph != null
      ? filterGraphByQuestionId(cumulativeGraph, questionId)
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
    submissionGraph,
    fullGraphForQuestion,
  };
}

export { getReportPageData };
