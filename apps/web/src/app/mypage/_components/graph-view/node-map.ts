import { GRAPH_NUMBER_CONSTANT } from "../../_constants/graph-view-constant";
import applyCenterGravity from "../../_lib/graph-view/apply-center-gravity";
import applyRepulsionForce from "../../_lib/graph-view/apply-repulsion-force";
import applySpringForce from "../../_lib/graph-view/apply-spring-force";
import updatePositions from "../../_lib/graph-view/update-positions";
import {
  GraphEdge,
  GraphNode,
  NodeMapType,
  NodePosition,
} from "../../_types/graph-view";

class NodeMap {
  private _nodeMap: NodeMapType;

  constructor(nodes: GraphNode[], width: number, height: number) {
    this._nodeMap = new Map();
    const centerX = width / 2;
    const centerY = height / 2;
    const nodeCount = nodes.length;
    // 화면 크기에 비례하는 원의 반지름 (화면의 50% 정도)
    const circleRadius = Math.min(width, height) * 0.5;

    nodes.forEach((node, index) => {
      // 원형으로 균등하게 배치
      const angle = (index / nodeCount) * 2 * Math.PI;
      const x = centerX + circleRadius * Math.cos(angle);
      const y = centerY + circleRadius * Math.sin(angle);

      this._nodeMap.set(node.id, {
        ...node,
        x,
        y,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
      });
    });
  }

  get nodeMap(): NodeMapType {
    return this._nodeMap;
  }

  getNode(nodeId: number): (GraphNode & NodePosition) | undefined {
    return this._nodeMap.get(nodeId);
  }

  applyPhysics(edges: GraphEdge[], centerX: number, centerY: number) {
    applyRepulsionForce(this._nodeMap);
    applySpringForce(edges, this._nodeMap);
    applyCenterGravity(this._nodeMap, centerX, centerY);
    updatePositions(this._nodeMap);
  }

  checkStable(): boolean {
    const nodes = [...this._nodeMap.values()];
    return nodes.every(
      (node) =>
        Math.abs(node.vx) <= GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD &&
        Math.abs(node.vy) <= GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD,
    );
  }

  setNodeFixedCoords(nodeId: number, x: number, y: number) {
    const node = this._nodeMap.get(nodeId);
    if (!node) return;
    node.fx = x;
    node.fy = y;
  }

  clearNodeFixedCoords(nodeId: number) {
    const node = this._nodeMap.get(nodeId);
    if (!node) return;
    node.fx = null;
    node.fy = null;
  }

  getNodeValues(): IterableIterator<GraphNode & NodePosition> {
    return this._nodeMap.values();
  }
}

export default NodeMap;
