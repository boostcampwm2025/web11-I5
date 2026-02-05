import { describe, expect, it } from "vitest";
import NodeMap from "../../_components/graph-view/node-map";
import applyRepulsionForce from "../../_lib/graph-view/apply-repulsion-force";
import { GraphNode, NodeType } from "../../_types/graph-view";

describe("applyRepulsionForce 함수 test", () => {
  it("nodes가 두 개 이상인 경우 applyRepulsionForce에 의해 속도가 변화한다.", () => {
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

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    // 테스트를 위해 노드 위치를 수동으로 설정
    const node1 = nodes.get(1)!;
    const node2 = nodes.get(2)!;
    node1.x = 0;
    node1.y = 0;
    node1.vx = 0;
    node1.vy = 0;
    node2.x = 10;
    node2.y = 0;
    node2.vx = 0;
    node2.vy = 0;

    // 초기 속도를 기록
    const node1InitialVx = node1.vx;
    const node2InitialVx = node2.vx;

    applyRepulsionForce(nodes);

    expect(node1.vx).not.toBe(node1InitialVx);
    expect(node2.vx).not.toBe(node2InitialVx);
  });

  it("applyRepulsionForce가 적용된 경우 두 노드의 속도의 부호가 반대여야한다.", () => {
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

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    // 테스트를 위해 노드 위치를 수동으로 설정
    const node1 = nodes.get(1)!;
    const node2 = nodes.get(2)!;
    node1.x = 0;
    node1.y = 0;
    node1.vx = 0;
    node1.vy = 0;
    node2.x = 5;
    node2.y = 5;
    node2.vx = 0;
    node2.vy = 0;

    applyRepulsionForce(nodes);

    // x 방향 속도의 부호가 반대여야 함
    expect(Math.sign(node1.vx)).not.toBe(Math.sign(node2.vx));

    // y 방향 속도의 부호가 반대여야 함
    expect(Math.sign(node1.vy)).not.toBe(Math.sign(node2.vy));
  });

  it("거리가 먼 두 노드가 거리가 가까운 두 노드보다 속도 변화가 작아야한다.", () => {
    // 가까운 두 노드
    const closeGraphNodes: GraphNode[] = [
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

    const closeNodeMap = new NodeMap(closeGraphNodes, 100, 100);
    const closeNodes = closeNodeMap.nodeMap;

    // 테스트를 위해 노드 위치를 수동으로 설정 (가까운 거리)
    const closeNode1 = closeNodes.get(1)!;
    const closeNode2 = closeNodes.get(2)!;
    closeNode1.x = 0;
    closeNode1.y = 0;
    closeNode1.vx = 0;
    closeNode1.vy = 0;
    closeNode2.x = 10;
    closeNode2.y = 0;
    closeNode2.vx = 0;
    closeNode2.vy = 0;

    // 먼 두 노드
    const farGraphNodes: GraphNode[] = [
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

    const farNodeMap = new NodeMap(farGraphNodes, 100, 100);
    const farNodes = farNodeMap.nodeMap;

    // 테스트를 위해 노드 위치를 수동으로 설정 (먼 거리)
    const farNode1 = farNodes.get(1)!;
    const farNode2 = farNodes.get(2)!;
    farNode1.x = 0;
    farNode1.y = 0;
    farNode1.vx = 0;
    farNode1.vy = 0;
    farNode2.x = 50;
    farNode2.y = 0;
    farNode2.vx = 0;
    farNode2.vy = 0;

    applyRepulsionForce(closeNodes);
    applyRepulsionForce(farNodes);

    // 가까운 노드의 속도 변화 크기
    const closeSpeedChange = Math.sqrt(closeNode1.vx ** 2 + closeNode1.vy ** 2);

    // 먼 노드의 속도 변화 크기
    const farSpeedChange = Math.sqrt(farNode1.vx ** 2 + farNode1.vy ** 2);

    // 가까운 노드의 속도 변화가 먼 노드보다 커야 함
    expect(closeSpeedChange).toBeGreaterThan(farSpeedChange);
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

    const nodeMap = new NodeMap(graphNodes, 100, 100);
    const nodes = nodeMap.nodeMap;

    // 테스트를 위해 노드 위치를 수동으로 설정
    const node1 = nodes.get(1)!;
    const node2 = nodes.get(2)!;
    node1.x = 0;
    node1.y = 0;
    node1.vx = 0;
    node1.vy = 0;
    node1.fx = 0; // 고정된 노드
    node1.fy = 0;
    node2.x = 10;
    node2.y = 0;
    node2.vx = 0;
    node2.vy = 0;
    node2.fx = null; // 고정되지 않은 노드
    node2.fy = null;

    applyRepulsionForce(nodes);

    // 고정된 노드는 속도가 변하지 않아야 함
    expect(node1.vx).toBe(0);
    expect(node1.vy).toBe(0);

    // 고정되지 않은 노드는 속도가 변해야 함
    expect(node2.vx).not.toBe(0);
  });
});
