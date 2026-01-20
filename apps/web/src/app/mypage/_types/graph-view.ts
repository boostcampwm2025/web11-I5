export enum NodeType {
  "QUESTION",
  "KEYWORD",
}

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
}

export type NodeMapType = Map<number, GraphNode & NodePosition>;
