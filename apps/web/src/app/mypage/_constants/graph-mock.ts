import { GraphData, NodeType } from "../types/graph-view";

export const mockGraphData: GraphData = {
  nodes: [
    // 기존
    { id: 1, type: NodeType.QUESTION, label: "React란 무엇인가요?" },
    { id: 2, type: NodeType.KEYWORD, label: "React" },
    { id: 3, type: NodeType.KEYWORD, label: "Virtual DOM" },
    { id: 4, type: NodeType.QUESTION, label: "Virtual DOM의 동작 원리는?" },
    { id: 5, type: NodeType.KEYWORD, label: "컴포넌트" },
    { id: 6, type: NodeType.QUESTION, label: "useState와 useEffect 차이점은?" },
    { id: 7, type: NodeType.KEYWORD, label: "Hook" },
    // 추가
    { id: 8, type: NodeType.KEYWORD, label: "State" },
    { id: 9, type: NodeType.KEYWORD, label: "Props" },
    { id: 10, type: NodeType.QUESTION, label: "State와 Props의 차이는?" },
    { id: 11, type: NodeType.KEYWORD, label: "Lifecycle" },
    { id: 12, type: NodeType.QUESTION, label: "React 컴포넌트 생명주기는?" },
    { id: 13, type: NodeType.KEYWORD, label: "useMemo" },
    { id: 14, type: NodeType.KEYWORD, label: "useCallback" },
    { id: 15, type: NodeType.QUESTION, label: "React 성능 최적화 방법은?" },
    { id: 16, type: NodeType.KEYWORD, label: "Context API" },
    {
      id: 17,
      type: NodeType.QUESTION,
      label: "Context API는 언제 사용하나요?",
    },
  ],
  edges: [
    // 기존
    { id: 1, sourceId: 1, targetId: 2 },
    { id: 2, sourceId: 1, targetId: 3 },
    { id: 3, sourceId: 4, targetId: 3 },
    { id: 4, sourceId: 1, targetId: 5 },
    { id: 5, sourceId: 6, targetId: 7 },
    { id: 6, sourceId: 6, targetId: 2 },
    // 추가
    { id: 7, sourceId: 10, targetId: 8 },
    { id: 8, sourceId: 10, targetId: 9 },
    { id: 9, sourceId: 12, targetId: 11 },
    { id: 10, sourceId: 12, targetId: 5 },
    { id: 11, sourceId: 15, targetId: 13 },
    { id: 12, sourceId: 15, targetId: 14 },
    { id: 13, sourceId: 15, targetId: 3 },
    { id: 14, sourceId: 17, targetId: 16 },
    { id: 15, sourceId: 17, targetId: 8 },
  ],
};
