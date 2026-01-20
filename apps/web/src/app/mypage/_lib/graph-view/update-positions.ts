import { PHISICS_CONSTANT } from "../../_constants/graph-view-constant";
import { NodeMapType } from "../../_types/graph-view";

function updatePositions(nodes: NodeMapType) {
  for (const node of nodes.values()) {
    if (node.fx !== null) {
      node.x = node.fx;
      node.y = node.fy!;
      node.vx = 0;
      node.vy = 0;
      continue;
    }

    node.vx *= PHISICS_CONSTANT.DAMPING;
    node.vy *= PHISICS_CONSTANT.DAMPING;

    const currentSpeed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (currentSpeed > PHISICS_CONSTANT.MAX_SPEED) {
      const ratio = PHISICS_CONSTANT.MAX_SPEED / currentSpeed;
      node.vx *= ratio;
      node.vy *= ratio;
    }

    node.x += node.vx;
    node.y += node.vy;
  }
}

export default updatePositions;
