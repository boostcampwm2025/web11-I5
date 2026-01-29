export const NodeType = {
  QUESTION: "QUESTION",
  KEYWORD: "KEYWORD",
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export interface GraphNode {
  id: number;
  type: NodeType;
  label: string;
  questionId: number | null;
}

export interface GraphEdge {
  id: number;
  sourceId: number;
  targetId: number;
  targetDistance?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NodePosition {
  x: number;
  y: number;
  vx: number; // x 방향 속도
  vy: number; // y 방향 속도
  fx: number | null; // 드래그시 사용하는 x좌표
  fy: number | null; // 드래그시 사용하는 y좌표
  // 애니메이션 상태
  displayRadius: number; // 현재 렌더링되는 반경
  displayAlpha: number; // 현재 렌더링되는 투명도 (0~1)
  displayHighlight: number; // 하이라이트 강도 (0~1, 호버/연결 시 1)
}

export type NodeMapType = Map<number, GraphNode & NodePosition>;
