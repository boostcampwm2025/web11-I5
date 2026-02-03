import { describe, expect, it } from "vitest";
import NodeMap from "../../_components/graph-view/node-map";
import {
  GRAPH_NUMBER_CONSTANT,
  PHISICS_CONSTANT,
} from "../../_constants/graph-view-constant";
import updatePositions from "../../_lib/graph-view/update-positions";
import { GraphNode, NodeType } from "../../_types/graph-view";

describe("updatePositions 함수 test", () => {
  it("fx가 고정된 노드는 위치가 fx, fy로 설정되고 속도가 0이 되어야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 50;
    node1.vx = 10;
    node1.vy = 10;
    node1.fx = 30; // 고정된 위치
    node1.fy = 40;

    updatePositions(nodes);

    // 위치가 fx, fy로 설정되어야 함
    expect(node1.x).toBe(30);
    expect(node1.y).toBe(40);

    // 속도가 0이 되어야 함
    expect(node1.vx).toBe(0);
    expect(node1.vy).toBe(0);
  });

  it("속도에 감쇠가 적용되어야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 50;
    node1.vx = 10;
    node1.vy = 10;
    node1.fx = null;
    node1.fy = null;

    const initialVx = node1.vx;
    const initialVy = node1.vy;

    updatePositions(nodes);

    // 감쇠가 적용되어 속도가 감소해야 함
    expect(Math.abs(node1.vx)).toBeLessThan(Math.abs(initialVx));
    expect(Math.abs(node1.vy)).toBeLessThan(Math.abs(initialVy));

    // 감쇠 비율 확인
    expect(node1.vx).toBeCloseTo(initialVx * PHISICS_CONSTANT.DAMPING);
    expect(node1.vy).toBeCloseTo(initialVy * PHISICS_CONSTANT.DAMPING);
  });

  it("속도가 임계값보다 작으면 0으로 설정되어야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 50;
    // 임계값보다 작은 속도 설정
    node1.vx = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.5;
    node1.vy = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.5;
    node1.fx = null;
    node1.fy = null;

    const initialX = node1.x;
    const initialY = node1.y;

    updatePositions(nodes);

    // 속도가 0이 되어야 함
    expect(node1.vx).toBe(0);
    expect(node1.vy).toBe(0);

    // 위치가 변하지 않아야 함
    expect(node1.x).toBe(initialX);
    expect(node1.y).toBe(initialY);
  });

  it("속도가 최대 속도보다 크면 제한되어야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 50;
    // 최대 속도보다 큰 속도 설정
    node1.vx = PHISICS_CONSTANT.MAX_SPEED * 2;
    node1.vy = PHISICS_CONSTANT.MAX_SPEED * 2;
    node1.fx = null;
    node1.fy = null;

    updatePositions(nodes);

    // 속도의 크기가 최대 속도 이하여야 함
    const speed = Math.sqrt(node1.vx ** 2 + node1.vy ** 2);
    expect(speed).toBeLessThanOrEqual(PHISICS_CONSTANT.MAX_SPEED + 0.01); // 부동소수점 오차 고려
  });

  it("위치가 속도만큼 업데이트되어야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 50;
    node1.vx = 5;
    node1.vy = 3;
    node1.fx = null;
    node1.fy = null;

    const initialX = node1.x;
    const initialY = node1.y;
    const initialVx = node1.vx;
    const initialVy = node1.vy;

    updatePositions(nodes);

    // 감쇠 후 속도
    const dampedVx = initialVx * PHISICS_CONSTANT.DAMPING;
    const dampedVy = initialVy * PHISICS_CONSTANT.DAMPING;

    // 위치가 감쇠된 속도만큼 업데이트되어야 함
    expect(node1.x).toBeCloseTo(initialX + dampedVx);
    expect(node1.y).toBeCloseTo(initialY + dampedVy);
  });

  it("고정되지 않은 노드는 위치가 변해야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 50;
    node1.vx = 5;
    node1.vy = 5;
    node1.fx = null;
    node1.fy = null;

    const initialX = node1.x;
    const initialY = node1.y;

    updatePositions(nodes);

    // 위치가 변해야 함
    expect(node1.x).not.toBe(initialX);
    expect(node1.y).not.toBe(initialY);
  });

  it("여러 노드가 있을 때 각각 올바르게 업데이트되어야한다.", () => {
    const graphNodes: GraphNode[] = [
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

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    // 노드 1: 고정된 노드
    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 50;
    node1.vx = 10;
    node1.vy = 10;
    node1.fx = 30;
    node1.fy = 30;

    // 노드 2: 일반 노드
    const node2 = nodes.get(2)!;
    node2.x = 20;
    node2.y = 20;
    node2.vx = 5;
    node2.vy = 5;
    node2.fx = null;
    node2.fy = null;

    // 노드 3: 매우 작은 속도를 가진 노드
    const node3 = nodes.get(3)!;
    node3.x = 70;
    node3.y = 70;
    node3.vx = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.1;
    node3.vy = GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD * 0.1;
    node3.fx = null;
    node3.fy = null;

    const node2InitialX = node2.x;
    const node2InitialY = node2.y;
    const node3InitialX = node3.x;
    const node3InitialY = node3.y;

    updatePositions(nodes);

    // 노드 1: 고정된 위치로 설정되고 속도는 0
    expect(node1.x).toBe(30);
    expect(node1.y).toBe(30);
    expect(node1.vx).toBe(0);
    expect(node1.vy).toBe(0);

    // 노드 2: 위치가 변해야 함
    expect(node2.x).not.toBe(node2InitialX);
    expect(node2.y).not.toBe(node2InitialY);

    // 노드 3: 속도가 0이 되고 위치가 변하지 않아야 함
    expect(node3.vx).toBe(0);
    expect(node3.vy).toBe(0);
    expect(node3.x).toBe(node3InitialX);
    expect(node3.y).toBe(node3InitialY);
  });

  it("감쇠 후 속도가 정확히 임계값일 때는 0으로 설정되지 않아야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 50;
    // 감쇠 후 임계값이 되도록 초기 속도 설정
    node1.vx =
      GRAPH_NUMBER_CONSTANT.VELOCITY_THRESHOLD / PHISICS_CONSTANT.DAMPING;
    node1.vy = 0;
    node1.fx = null;
    node1.fy = null;

    updatePositions(nodes);

    // 감쇠 후 속도가 임계값과 같으므로 0이 되지 않아야 함
    expect(node1.vx).not.toBe(0);
  });
});
