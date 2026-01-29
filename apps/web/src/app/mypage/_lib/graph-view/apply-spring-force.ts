import {
  GRAPH_NUMBER_CONSTANT,
  PHISICS_CONSTANT,
} from "../../_constants/graph-view-constant";
import { GraphEdge, NodeMapType } from "../../_types/graph-view";

// 당기는 힘 => F = strength * (currentDistance - targetDistance)
function applySpringForce(edges: GraphEdge[], nodes: NodeMapType) {
  for (const edge of edges) {
    const sourceNode = nodes.get(edge.sourceId);
    const targetNode = nodes.get(edge.targetId);

    if (!sourceNode || !targetNode) continue;

    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;

    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 1) distance = 1;

    // edge에 targetDistance가 있으면 사용, 없으면 기본값 사용
    const targetDistance =
      edge.targetDistance ?? GRAPH_NUMBER_CONSTANT.EDGE_DISTANCE;

    const force =
      PHISICS_CONSTANT.SPRING_STRENGTH * (distance - targetDistance);

    const forceX = (dx / distance) * force;
    const forceY = (dy / distance) * force;

    if (sourceNode.fx === null) {
      sourceNode.vx += forceX;
      sourceNode.vy += forceY;
    }
    if (targetNode.fx === null) {
      targetNode.vx -= forceX;
      targetNode.vy -= forceY;
    }
  }
}

export default applySpringForce;
