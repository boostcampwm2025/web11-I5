import { PHISICS_CONSTANT } from "../../_constants/graph-view-constant";
import { NodeMapType } from "../../_types/graph-view";

// 미는 힘 => F = strength / distance^2
function applyRepulsionForce(nodes: NodeMapType) {
  const nodeArr = [...nodes.values()];
  for (let i = 0; i < nodeArr.length; i++) {
    for (let j = i + 1; j < nodeArr.length; j++) {
      const nodeA = nodeArr[i];
      const nodeB = nodeArr[j];

      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;

      const distanceSquared = dx * dx + dy * dy;
      let distance = Math.sqrt(distanceSquared);
      if (distance < 1) distance = 1;

      const force = PHISICS_CONSTANT.REPULSION / distanceSquared;

      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;

      if (nodeA.fx === null) {
        nodeA.vx -= forceX;
        nodeA.vy -= forceY;
      }
      if (nodeB.fx === null) {
        nodeB.vx += forceX;
        nodeB.vy += forceY;
      }
    }
  }
}

export default applyRepulsionForce;
