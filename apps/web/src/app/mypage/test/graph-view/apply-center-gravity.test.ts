import { describe, expect, it } from "vitest";
import NodeMap from "../../_components/graph-view/node-map";
import applyCenterGravity from "../../_lib/graph-view/apply-center-gravity";
import { GraphNode, NodeType } from "../../_types/graph-view";

describe("applyCenterGravity 함수 test", () => {
  it("중력을 적용하면 노드의 속도가 중심을 향해 변화해야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const centerX = 50;
    const centerY = 50;

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 10;
    node1.y = 10;
    node1.vx = 0;
    node1.vy = 0;

    const initialVx = node1.vx;
    const initialVy = node1.vy;

    applyCenterGravity(nodes, centerX, centerY);

    // 속도가 변해야 함
    expect(node1.vx).not.toBe(initialVx);
    expect(node1.vy).not.toBe(initialVy);
  });

  it("중심보다 오른쪽에 있는 노드는 왼쪽으로 속도가 생겨야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const centerX = 50;
    const centerY = 50;

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 80; // 중심보다 오른쪽
    node1.y = 50;
    node1.vx = 0;
    node1.vy = 0;

    applyCenterGravity(nodes, centerX, centerY);

    // 왼쪽으로 당겨져야 함 (음수 방향)
    expect(node1.vx).toBeLessThan(0);
  });

  it("중심보다 왼쪽에 있는 노드는 오른쪽으로 속도가 생겨야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const centerX = 50;
    const centerY = 50;

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 20; // 중심보다 왼쪽
    node1.y = 50;
    node1.vx = 0;
    node1.vy = 0;

    applyCenterGravity(nodes, centerX, centerY);

    // 오른쪽으로 당겨져야 함 (양수 방향)
    expect(node1.vx).toBeGreaterThan(0);
  });

  it("중심보다 아래에 있는 노드는 위로 속도가 생겨야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const centerX = 50;
    const centerY = 50;

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 80; // 중심보다 아래
    node1.vx = 0;
    node1.vy = 0;

    applyCenterGravity(nodes, centerX, centerY);

    // 위로 당겨져야 함 (음수 방향)
    expect(node1.vy).toBeLessThan(0);
  });

  it("중심보다 위에 있는 노드는 아래로 속도가 생겨야한다.", () => {
    const graphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const centerX = 50;
    const centerY = 50;

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 50;
    node1.y = 20; // 중심보다 위
    node1.vx = 0;
    node1.vy = 0;

    applyCenterGravity(nodes, centerX, centerY);

    // 아래로 당겨져야 함 (양수 방향)
    expect(node1.vy).toBeGreaterThan(0);
  });

  it("중심에서 멀리 있는 노드일수록 더 큰 힘을 받아야한다.", () => {
    const centerX = 50;
    const centerY = 50;

    // 가까운 노드
    const closeGraphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const closeNodeMap = new NodeMap(closeGraphNodes, 100, 100);
    const closeNodes = closeNodeMap.nodeMap;

    const closeNode = closeNodes.get(1)!;
    closeNode.x = 45; // 중심에서 5만큼 떨어짐
    closeNode.y = 50;
    closeNode.vx = 0;
    closeNode.vy = 0;

    // 먼 노드
    const farGraphNodes: GraphNode[] = [
      {
        id: 1,
        type: NodeType.QUESTION,
        label: "Node 1",
        questionId: 1,
      },
    ];

    const farNodeMap = new NodeMap(farGraphNodes, 100, 100);
    const farNodes = farNodeMap.nodeMap;

    const farNode = farNodes.get(1)!;
    farNode.x = 10; // 중심에서 40만큼 떨어짐
    farNode.y = 50;
    farNode.vx = 0;
    farNode.vy = 0;

    applyCenterGravity(closeNodes, centerX, centerY);
    applyCenterGravity(farNodes, centerX, centerY);

    // 먼 노드의 속도 변화가 더 커야 함
    expect(Math.abs(farNode.vx)).toBeGreaterThan(Math.abs(closeNode.vx));
  });

  it("fx가 고정된 노드는 속도가 변하지 않아야한다.", () => {
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
    ];

    const centerX = 50;
    const centerY = 50;

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    const node1 = nodes.get(1)!;
    node1.x = 10;
    node1.y = 10;
    node1.vx = 0;
    node1.vy = 0;
    node1.fx = 10; // 고정된 노드
    node1.fy = 10;

    const node2 = nodes.get(2)!;
    node2.x = 10;
    node2.y = 10;
    node2.vx = 0;
    node2.vy = 0;
    node2.fx = null; // 고정되지 않은 노드
    node2.fy = null;

    applyCenterGravity(nodes, centerX, centerY);

    // 고정된 노드는 속도가 변하지 않아야 함
    expect(node1.vx).toBe(0);
    expect(node1.vy).toBe(0);

    // 고정되지 않은 노드는 속도가 변해야 함
    expect(node2.vx).not.toBe(0);
    expect(node2.vy).not.toBe(0);
  });

  it("모든 노드가 중심을 향해 당겨져야한다.", () => {
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
      {
        id: 4,
        type: NodeType.QUESTION,
        label: "Node 4",
        questionId: 4,
      },
    ];

    const centerX = 50;
    const centerY = 50;

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    // 4개의 노드를 중심 주변에 배치
    const node1 = nodes.get(1)!;
    node1.x = 30; // 왼쪽
    node1.y = 50;
    node1.vx = 0;
    node1.vy = 0;

    const node2 = nodes.get(2)!;
    node2.x = 70; // 오른쪽
    node2.y = 50;
    node2.vx = 0;
    node2.vy = 0;

    const node3 = nodes.get(3)!;
    node3.x = 50;
    node3.y = 30; // 위
    node3.vx = 0;
    node3.vy = 0;

    const node4 = nodes.get(4)!;
    node4.x = 50;
    node4.y = 70; // 아래
    node4.vx = 0;
    node4.vy = 0;

    applyCenterGravity(nodes, centerX, centerY);

    // 각 노드가 중심을 향해 당겨져야 함
    expect(node1.vx).toBeGreaterThan(0); // 오른쪽으로
    expect(node2.vx).toBeLessThan(0); // 왼쪽으로
    expect(node3.vy).toBeGreaterThan(0); // 아래로
    expect(node4.vy).toBeLessThan(0); // 위로
  });
});
