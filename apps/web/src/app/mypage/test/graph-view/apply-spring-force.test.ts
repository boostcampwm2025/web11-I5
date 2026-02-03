import { describe, expect, it } from "vitest";
import NodeMap from "../../_components/graph-view/node-map";
import applySpringForce from "../../_lib/graph-view/apply-spring-force";
import { GraphEdge, GraphNode, NodeType } from "../../_types/graph-view";

describe("applySpringForce 함수 test", () => {
  it("edge가 연결되어있지 않은 두 노드는 applySpringForce를 적용받지 않는다.", () => {
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

    // 노드 1과 2는 edge로 연결, 노드 3은 독립적
    const edges: GraphEdge[] = [
      {
        id: 1,
        sourceId: 1,
        targetId: 2,
        targetDistance: 50,
      },
    ];

    // 노드 위치 설정
    const node1 = nodes.get(1)!;
    const node2 = nodes.get(2)!;
    const node3 = nodes.get(3)!;

    node1.x = 0;
    node1.y = 0;
    node1.vx = 0;
    node1.vy = 0;

    node2.x = 30;
    node2.y = 0;
    node2.vx = 0;
    node2.vy = 0;

    node3.x = 50;
    node3.y = 50;
    node3.vx = 0;
    node3.vy = 0;

    applySpringForce(edges, nodes);

    // 연결된 노드 1, 2는 속도가 변해야 함
    expect(node1.vx).not.toBe(0);
    expect(node2.vx).not.toBe(0);

    // 연결되지 않은 노드 3은 속도가 변하지 않아야 함
    expect(node3.vx).toBe(0);
    expect(node3.vy).toBe(0);
  });

  it("edge가 연결되어있는 두 노드는 applySpringForce에 의해 속도가 생긴다.", () => {
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

    const edges: GraphEdge[] = [
      {
        id: 1,
        sourceId: 1,
        targetId: 2,
        targetDistance: 50,
      },
    ];

    // 노드 위치 설정
    const node1 = nodes.get(1)!;
    const node2 = nodes.get(2)!;

    node1.x = 0;
    node1.y = 0;
    node1.vx = 0;
    node1.vy = 0;

    node2.x = 30;
    node2.y = 0;
    node2.vx = 0;
    node2.vy = 0;

    // 초기 속도 기록
    const node1InitialVx = node1.vx;
    const node2InitialVx = node2.vx;

    applySpringForce(edges, nodes);

    // 속도가 변해야 함
    expect(node1.vx).not.toBe(node1InitialVx);
    expect(node2.vx).not.toBe(node2InitialVx);
  });

  it("edge로 연결되어있는 두 노드가 targetDistance보다 멀면 서로 당겨져야된다.", () => {
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

    const targetDistance = 30;
    const edges: GraphEdge[] = [
      {
        id: 1,
        sourceId: 1,
        targetId: 2,
        targetDistance: targetDistance,
      },
    ];

    // 노드 위치 설정 (현재 거리가 targetDistance보다 멀게)
    const node1 = nodes.get(1)!;
    const node2 = nodes.get(2)!;

    node1.x = 0;
    node1.y = 0;
    node1.vx = 0;
    node1.vy = 0;

    node2.x = 100; // targetDistance(30)보다 먼 거리
    node2.y = 0;
    node2.vx = 0;
    node2.vy = 0;

    applySpringForce(edges, nodes);

    // source 노드는 오른쪽으로(+x 방향), target 노드는 왼쪽으로(-x 방향) 당겨져야 함
    expect(node1.vx).toBeGreaterThan(0); // 오른쪽으로 당겨짐
    expect(node2.vx).toBeLessThan(0); // 왼쪽으로 당겨짐

    // 속도의 부호가 반대여야 함 (서로를 향해 당겨짐)
    expect(Math.sign(node1.vx)).not.toBe(Math.sign(node2.vx));
  });

  it("edge로 연결되어있는 두 노드가 targetDistance보다 가까우면 서로 밀어내야한다.", () => {
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

    const targetDistance = 50;
    const edges: GraphEdge[] = [
      {
        id: 1,
        sourceId: 1,
        targetId: 2,
        targetDistance: targetDistance,
      },
    ];

    // 노드 위치 설정 (현재 거리가 targetDistance보다 가까우게)
    const node1 = nodes.get(1)!;
    const node2 = nodes.get(2)!;

    node1.x = 0;
    node1.y = 0;
    node1.vx = 0;
    node1.vy = 0;

    node2.x = 10; // targetDistance(50)보다 가까운 거리
    node2.y = 0;
    node2.vx = 0;
    node2.vy = 0;

    applySpringForce(edges, nodes);

    // source 노드는 왼쪽으로(-x 방향), target 노드는 오른쪽으로(+x 방향) 밀려나야 함
    expect(node1.vx).toBeLessThan(0); // 왼쪽으로 밀려남
    expect(node2.vx).toBeGreaterThan(0); // 오른쪽으로 밀려남

    // 속도의 부호가 반대여야 함 (서로 밀어냄)
    expect(Math.sign(node1.vx)).not.toBe(Math.sign(node2.vx));
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

    const edges: GraphEdge[] = [
      {
        id: 1,
        sourceId: 1,
        targetId: 2,
        targetDistance: 50,
      },
    ];

    // 노드 위치 설정
    const node1 = nodes.get(1)!;
    const node2 = nodes.get(2)!;

    node1.x = 0;
    node1.y = 0;
    node1.vx = 0;
    node1.vy = 0;
    node1.fx = 0; // 고정된 노드
    node1.fy = 0;

    node2.x = 30;
    node2.y = 0;
    node2.vx = 0;
    node2.vy = 0;
    node2.fx = null; // 고정되지 않은 노드
    node2.fy = null;

    applySpringForce(edges, nodes);

    // 고정된 노드는 속도가 변하지 않아야 함
    expect(node1.vx).toBe(0);
    expect(node1.vy).toBe(0);

    // 고정되지 않은 노드는 속도가 변해야 함
    expect(node2.vx).not.toBe(0);
  });
});
