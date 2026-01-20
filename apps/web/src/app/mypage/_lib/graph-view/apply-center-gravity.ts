import { PHISICS_CONSTANT } from "../../_constants/graph-view-constant";
import { NodeMapType } from "../../_types/graph-view";

function applyCenterGravity(
  nodes: NodeMapType,
  centerX: number,
  centerY: number,
) {
  for (const node of nodes.values()) {
    if (node.fx !== null) continue;

    node.vx += (centerX - node.x) * PHISICS_CONSTANT.CENTER_GRAVITY;
    node.vy += (centerY - node.y) * PHISICS_CONSTANT.CENTER_GRAVITY;
  }
}

export default applyCenterGravity;
