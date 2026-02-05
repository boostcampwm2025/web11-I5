import { describe, expect, it } from "vitest";
import NodeMap from "../../_components/graph-view/node-map";
import { GRAPH_NUMBER_CONSTANT } from "../../_constants/graph-view-constant";
import { GraphEdge, GraphNode, NodeType } from "../../_types/graph-view";

describe("NodeMap 클래스 test", () => {
  describe("constructor", () => {
    it("노드들이 원형으로 균등하게 배치되어야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
        {
          id: 3,
          type: NodeType.QUESTION,
          label: "Node 3",
          questionId: 3,
        },
      ];

      const width = 500;
      const height = 500;
      const nodeMap = new NodeMap(nodes, width, height);

      const nodeValues = [...nodeMap.getNodeValues()];
      const centerX = width / 2;
      const centerY = height / 2;

      nodeValues.forEach((node, index) => {
        const expectedAngle = (index / nodes.length) * 2 * Math.PI;
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const actualAngle = Math.atan2(dy, dx);

        // 각도가 예상 각도와 일치하거나 2π 차이여야 함 (0과 2π는 같은 각도)
        const angleDiff = Math.abs(actualAngle - expectedAngle);
        const normalizedDiff = Math.min(
          angleDiff,
          Math.abs(angleDiff - 2 * Math.PI),
        );
        expect(normalizedDiff).toBeLessThan(0.01);
      });
    });

    it("초기 속도는 0이어야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(1)!;

      expect(node.vx).toBe(0);
      expect(node.vy).toBe(0);
    });

    it("고정 좌표(fx, fy)는 null이어야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(1)!;

      expect(node.fx).toBeNull();
      expect(node.fy).toBeNull();
    });

    it("displayRadius, displayAlpha, displayHighlight가 올바르게 초기화되어야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(1)!;
      const baseRadius = GRAPH_NUMBER_CONSTANT.NODE_RADIUS;

      expect(node.displayRadius).toBe(baseRadius + 1); // QUESTION 타입은 +1
      expect(node.displayAlpha).toBe(1);
      expect(node.displayHighlight).toBe(0);
    });

    it("QUESTION 타입 노드의 반경이 KEYWORD 타입보다 1 커야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.KEYWORD,
          label: "Node 2",
          questionId: null,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const questionNode = nodeMap.getNode(1)!;
      const keywordNode = nodeMap.getNode(2)!;

      expect(questionNode.displayRadius).toBe(keywordNode.displayRadius + 1);
    });

    it("노드 개수만큼 Map에 저장되어야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
        {
          id: 3,
          type: NodeType.KEYWORD,
          label: "Node 3",
          questionId: null,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);

      expect(nodeMap.nodeMap.size).toBe(3);
    });

    it("각 노드가 중심점으로부터 일정한 반경에 위치해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
        {
          id: 3,
          type: NodeType.QUESTION,
          label: "Node 3",
          questionId: 3,
        },
      ];

      const width = 500;
      const height = 500;
      const nodeMap = new NodeMap(nodes, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const expectedRadius = Math.min(width, height) * 0.5;

      const nodeValues = [...nodeMap.getNodeValues()];

      nodeValues.forEach((node) => {
        const distance = Math.sqrt(
          (node.x - centerX) ** 2 + (node.y - centerY) ** 2,
        );
        expect(distance).toBeCloseTo(expectedRadius, 1);
      });
    });
  });

  describe("getNode 메서드", () => {
    it("존재하는 nodeId를 전달하면 해당 노드를 반환해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(1);

      expect(node).toBeDefined();
      expect(node?.id).toBe(1);
      expect(node?.label).toBe("Node 1");
    });

    it("존재하지 않는 nodeId를 전달하면 undefined를 반환해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(999);

      expect(node).toBeUndefined();
    });
  });

  describe("applyPhysics 메서드", () => {
    it("물리 엔진이 적용되어 노드의 속도가 변해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
      ];

      const edges: GraphEdge[] = [
        {
          id: 1,
          sourceId: 1,
          targetId: 2,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node1 = nodeMap.getNode(1)!;
      const node2 = nodeMap.getNode(2)!;

      // 초기 위치 설정
      node1.x = 0;
      node1.y = 0;
      node1.vx = 0;
      node1.vy = 0;
      node2.x = 10;
      node2.y = 0;
      node2.vx = 0;
      node2.vy = 0;

      nodeMap.applyPhysics(edges, 50, 50);

      // 척력, 인력, 중력이 적용되어 속도가 변해야 함
      expect(node1.vx).not.toBe(0);
    });

    it("고정된 노드(fx !== null)는 속도가 변하지 않아야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
      ];

      const edges: GraphEdge[] = [
        {
          id: 1,
          sourceId: 1,
          targetId: 2,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node1 = nodeMap.getNode(1)!;
      const node2 = nodeMap.getNode(2)!;

      // 노드 1 고정
      node1.x = 0;
      node1.y = 0;
      node1.vx = 0;
      node1.vy = 0;
      node1.fx = 0;
      node1.fy = 0;

      node2.x = 10;
      node2.y = 0;
      node2.vx = 0;
      node2.vy = 0;

      nodeMap.applyPhysics(edges, 50, 50);

      // 고정된 노드는 속도가 0으로 유지되어야 함
      expect(node1.vx).toBe(0);
      expect(node1.vy).toBe(0);
    });

    it("updatePositions가 호출되어 위치가 업데이트되어야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
      ];

      const edges: GraphEdge[] = [
        {
          id: 1,
          sourceId: 1,
          targetId: 2,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node1 = nodeMap.getNode(1)!;
      const node2 = nodeMap.getNode(2)!;

      node1.x = 50;
      node1.y = 50;
      node1.vx = 0;
      node1.vy = 0;
      node2.x = 52;
      node2.y = 50;
      node2.vx = 0;
      node2.vy = 0;

      const initialX = node1.x;
      const initialY = node1.y;

      nodeMap.applyPhysics(edges, 50, 50);

      // 위치가 변했는지 확인 (가속도 임계값을 넘어 위치가 변경됨)
      const positionChanged = node1.x !== initialX || node1.y !== initialY;
      expect(positionChanged).toBe(true);
    });
  });

  describe("checkStable 메서드", () => {
    it("모든 노드의 속도가 임계값 이하이면 true를 반환해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node1 = nodeMap.getNode(1)!;
      const node2 = nodeMap.getNode(2)!;

      // 모든 노드의 속도를 임계값 이하로 설정
      node1.vx = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.5;
      node1.vy = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.5;
      node2.vx = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.3;
      node2.vy = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.3;

      expect(nodeMap.checkStable()).toBe(true);
    });

    it("하나라도 속도가 임계값을 초과하면 false를 반환해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node1 = nodeMap.getNode(1)!;
      const node2 = nodeMap.getNode(2)!;

      // 노드 1은 안정적, 노드 2는 불안정
      node1.vx = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.5;
      node1.vy = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.5;
      node2.vx = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 2;
      node2.vy = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.5;

      expect(nodeMap.checkStable()).toBe(false);
    });

    it("x, y 속도 중 하나만 임계값을 초과해도 false를 반환해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node1 = nodeMap.getNode(1)!;

      // x 속도만 임계값 초과
      node1.vx = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 2;
      node1.vy = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.5;

      expect(nodeMap.checkStable()).toBe(false);

      // y 속도만 임계값 초과
      node1.vx = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.5;
      node1.vy = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 2;

      expect(nodeMap.checkStable()).toBe(false);
    });
  });

  describe("setNodeFixedCoords 메서드", () => {
    it("노드의 fx, fy가 올바르게 설정되어야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(1)!;

      nodeMap.setNodeFixedCoords(1, 50, 75);

      expect(node.fx).toBe(50);
      expect(node.fy).toBe(75);
    });

    it("존재하지 않는 nodeId를 전달해도 에러가 발생하지 않아야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);

      // 에러가 발생하지 않아야 함
      expect(() => {
        nodeMap.setNodeFixedCoords(999, 50, 75);
      }).not.toThrow();
    });
  });

  describe("clearNodeFixedCoords 메서드", () => {
    it("노드의 fx, fy가 null로 설정되어야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(1)!;

      // 먼저 고정
      nodeMap.setNodeFixedCoords(1, 50, 75);
      expect(node.fx).toBe(50);
      expect(node.fy).toBe(75);

      // 고정 해제
      nodeMap.clearNodeFixedCoords(1);
      expect(node.fx).toBeNull();
      expect(node.fy).toBeNull();
    });

    it("존재하지 않는 nodeId를 전달해도 에러가 발생하지 않아야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);

      // 에러가 발생하지 않아야 함
      expect(() => {
        nodeMap.clearNodeFixedCoords(999);
      }).not.toThrow();
    });
  });

  describe("getNodeValues 메서드", () => {
    it("모든 노드 값을 반환해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.KEYWORD,
          label: "Node 2",
          questionId: null,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const nodeValues = [...nodeMap.getNodeValues()];

      expect(nodeValues.length).toBe(2);
      expect(nodeValues[0].id).toBeDefined();
      expect(nodeValues[1].id).toBeDefined();
    });

    it("반환된 iterator가 올바른 개수의 노드를 포함해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
        {
          id: 3,
          type: NodeType.KEYWORD,
          label: "Node 3",
          questionId: null,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const nodeValues = [...nodeMap.getNodeValues()];

      expect(nodeValues.length).toBe(3);
    });
  });

  describe("updateAnimations 메서드", () => {
    it("호버된 노드의 displayRadius가 증가해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.KEYWORD,
          label: "Node 1",
          questionId: null,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(1)!;

      const initialRadius = node.displayRadius;

      // 호버 상태로 애니메이션 업데이트
      nodeMap.updateAnimations(1, new Set());

      // displayRadius가 targetRadius(baseRadius + 2)에 가까워져야 함
      expect(node.displayRadius).toBeGreaterThan(initialRadius);
    });

    it("연결되지 않은 노드의 displayAlpha가 감소해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node2 = nodeMap.getNode(2)!;

      const initialAlpha = node2.displayAlpha;

      // 노드 1만 호버, 노드 2는 연결되지 않음
      nodeMap.updateAnimations(1, new Set([1]));

      // displayAlpha가 감소해야 함 (dimmed)
      expect(node2.displayAlpha).toBeLessThan(initialAlpha);
    });

    it("호버되거나 연결된 노드의 displayHighlight가 1에 가까워져야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node1 = nodeMap.getNode(1)!;
      const node2 = nodeMap.getNode(2)!;

      // 초기 highlight는 0
      expect(node1.displayHighlight).toBe(0);
      expect(node2.displayHighlight).toBe(0);

      // 노드 1 호버, 노드 2 연결됨
      nodeMap.updateAnimations(1, new Set([1, 2]));

      // displayHighlight가 증가해야 함
      expect(node1.displayHighlight).toBeGreaterThan(0);
      expect(node2.displayHighlight).toBeGreaterThan(0);
    });

    it("호버되지 않은 노드의 displayRadius가 원래 크기로 돌아와야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.KEYWORD,
          label: "Node 1",
          questionId: null,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(1)!;

      // 호버 상태로 설정
      nodeMap.updateAnimations(1, new Set([1]));
      const hoveredRadius = node.displayRadius;

      // 호버 해제
      nodeMap.updateAnimations(null, new Set());

      // displayRadius가 baseRadius에 가까워져야 함
      expect(node.displayRadius).toBeLessThan(hoveredRadius);
    });

    it("LERP가 적용되어 값이 즉시 변하지 않고 점진적으로 변해야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.KEYWORD,
          label: "Node 1",
          questionId: null,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node = nodeMap.getNode(1)!;

      const baseRadius = GRAPH_NUMBER_CONSTANT.NODE_RADIUS;
      const targetRadius = baseRadius + 2;

      // 호버 상태로 애니메이션 업데이트 (1번만)
      nodeMap.updateAnimations(1, new Set([1]));

      // displayRadius가 targetRadius에 도달하지 않았어야 함 (lerp로 점진적)
      expect(node.displayRadius).toBeLessThan(targetRadius);
      expect(node.displayRadius).toBeGreaterThan(baseRadius);
    });

    it("hoveredNodeId가 null이면 모든 노드가 기본 상태여야한다.", () => {
      const nodes: GraphNode[] = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: "Node 1",
          questionId: 1,
        },
        {
          id: 2,
          type: NodeType.QUESTION,
          label: "Node 2",
          questionId: 2,
        },
      ];

      const nodeMap = new NodeMap(nodes, 100, 100);
      const node1 = nodeMap.getNode(1)!;
      const node2 = nodeMap.getNode(2)!;

      // 초기 값 설정
      node1.displayAlpha = 0.5;
      node2.displayAlpha = 0.5;

      // hoveredNodeId가 null
      nodeMap.updateAnimations(null, new Set());

      // displayAlpha가 1에 가까워져야 함 (dimmed 해제)
      expect(node1.displayAlpha).toBeGreaterThan(0.5);
      expect(node2.displayAlpha).toBeGreaterThan(0.5);
    });
  });
});
