import {
  GRAPH_COLOR_CONSTANT,
  GRAPH_NUMBER_CONSTANT,
} from "../../_constants/graph-view-constant";
import applyCenterGravity from "../../_lib/graph-view/apply-center-gravity";
import applyRepulsionForce from "../../_lib/graph-view/apply-repulsion-force";
import applySpringForce from "../../_lib/graph-view/apply-spring-force";
import updatePositions from "../../_lib/graph-view/update-positions";
import {
  GraphEdge,
  GraphNode,
  NodeMapType,
  NodePosition,
  NodeType,
} from "../../_types/graph-view";

// 0.05 (~300ms)
// 0.15 (~150ms)
// 0.25 (~80ms)
const LERP_FACTOR = 0.05;

class NodeMap {
  private _nodeMap: NodeMapType;

  constructor(nodes: GraphNode[], width: number, height: number) {
    this._nodeMap = new Map();
    const baseRadius = GRAPH_NUMBER_CONSTANT.NODE_RADIUS;
    const centerX = width / 2;
    const centerY = height / 2;
    const nodeCount = nodes.length;
    // 화면 크기에 비례하는 원의 반지름 (화면의 50% 정도)
    const circleRadius = Math.min(width, height) * 0.5;

    nodes.forEach((node, index) => {
      const initialRadius =
        node.type === NodeType.QUESTION ? baseRadius + 1 : baseRadius;
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
        displayRadius: initialRadius,
        displayAlpha: 1,
        displayHighlight: 0,
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

  updateAnimations(
    hoveredNodeId: number | null,
    connectedNodeIds: Set<number>,
  ) {
    const baseRadius = GRAPH_NUMBER_CONSTANT.NODE_RADIUS;

    for (const node of this._nodeMap.values()) {
      const isHovered = node.id === hoveredNodeId;
      const isConnected = connectedNodeIds.has(node.id);
      const isDimmed = hoveredNodeId !== null && !isHovered && !isConnected;

      // 타겟 반경 계산
      const nodeBaseRadius =
        node.type === NodeType.QUESTION ? baseRadius + 1 : baseRadius;
      const targetRadius = isHovered ? nodeBaseRadius + 2 : nodeBaseRadius;

      // 타겟 알파 계산
      const targetAlpha = isDimmed ? GRAPH_COLOR_CONSTANT.NOT_HOVERED_ALPHA : 1;

      // 타겟 하이라이트 계산 (호버되거나 연결된 노드는 1)
      const targetHighlight = isHovered || isConnected ? 1 : 0;

      // lerp 적용
      node.displayRadius += (targetRadius - node.displayRadius) * LERP_FACTOR;
      node.displayAlpha += (targetAlpha - node.displayAlpha) * LERP_FACTOR;
      node.displayHighlight +=
        (targetHighlight - node.displayHighlight) * LERP_FACTOR;
    }
  }
}

export default NodeMap;
