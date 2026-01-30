import { GRAPH_NUMBER_CONSTANT } from "../../_constants/graph-view-constant";
import { GraphEdge } from "../../_types/graph-view";

export function addRandomEdgeDistance(
  edges: GraphEdge[],
  minRatio: number = 0.7,
  maxRatio: number = 1.3,
): GraphEdge[] {
  const baseDistance = GRAPH_NUMBER_CONSTANT.EDGE_DISTANCE;

  return edges.map((edge) => ({
    ...edge,
    targetDistance:
      baseDistance * (minRatio + Math.random() * (maxRatio - minRatio)),
  }));
}
