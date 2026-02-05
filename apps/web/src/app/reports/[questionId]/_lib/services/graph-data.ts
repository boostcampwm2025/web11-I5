import { apiGet } from "@/lib/api-client";
import { logger } from "@/lib/sentry-logger";
import type { GraphData } from "@/app/mypage/_types/graph-view";
import { NodeType } from "@/app/mypage/_types/graph-view";

/**
 * 제출별로 해당 제출에서 추가된 그래프(노드·엣지)를 조회한다.
 * 실패 시 null 반환 (리포트 페이지는 그래프 없이도 렌더링 가능하도록).
 */
async function getReportGraph(submissionId: number): Promise<GraphData | null> {
  try {
    return await apiGet<GraphData>(`/graph/submission/${submissionId}`);
  } catch (error) {
    logger.warn("제출별 그래프 조회 실패", {
      submissionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * 전체 그래프를 조회한다. 실패 시 null 반환.
 */
async function getReportFullGraph(): Promise<GraphData | null> {
  try {
    return await apiGet<GraphData>("/graph");
  } catch (error) {
    logger.warn("전체 그래프 조회 실패", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * 여러 제출 ID까지의 누적 그래프를 조회한다.
 * (이전 제출을 볼 때 그 시점의 그래프 모양 표시용). 실패 시 null 반환.
 */
async function getReportGraphBySubmissionIds(
  submissionIds: number[],
): Promise<GraphData | null> {
  if (submissionIds.length === 0) return null;
  try {
    const ids = submissionIds.join(",");
    return await apiGet<GraphData>(
      `/graph/submissions?ids=${encodeURIComponent(ids)}`,
    );
  } catch (error) {
    logger.warn("누적 그래프 조회 실패", {
      submissionIds,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * 전체 그래프에서 특정 문제(questionId)에 해당하는 서브그래프만 추린다.
 * 해당 문제 노드와 그에 연결된 키워드 노드·엣지를 반환한다.
 */
function filterGraphByQuestionId(
  fullGraph: GraphData,
  questionId: number,
): GraphData {
  const questionNode = fullGraph.nodes.find(
    (n) => n.type === NodeType.QUESTION && n.questionId === questionId,
  );
  if (!questionNode) {
    return { nodes: [], edges: [] };
  }

  const nodeIds = new Set<number>([questionNode.id]);
  for (const edge of fullGraph.edges) {
    if (
      edge.sourceId === questionNode.id ||
      edge.targetId === questionNode.id
    ) {
      nodeIds.add(edge.sourceId);
      nodeIds.add(edge.targetId);
    }
  }

  const nodes = fullGraph.nodes.filter((n) => nodeIds.has(n.id));
  const edges = fullGraph.edges.filter(
    (e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId),
  );

  return { nodes, edges };
}

export {
  getReportGraph,
  getReportFullGraph,
  getReportGraphBySubmissionIds,
  filterGraphByQuestionId,
};
