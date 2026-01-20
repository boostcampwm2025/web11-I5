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
    const radius = GRAPH_NUMBER_CONSTANT.NODE_RADIUS;
    nodes.forEach((node) => {
      this._nodeMap.set(node.id, {
        ...node,
        x: Math.random() * (width - radius * 2) + radius,
        y: Math.random() * (height - radius * 2) + radius,
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
