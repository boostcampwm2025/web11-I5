import { describe, expect, it } from "vitest";
import { GRAPH_NUMBER_CONSTANT } from "../../_constants/graph-view-constant";
import { addRandomEdgeDistance } from "../../_lib/graph-view/add-random-edge-distance";
import { GraphEdge } from "../../_types/graph-view";

describe("addRandomEdgeDistance 함수 test", () => {
  const edges: GraphEdge[] = [
    {
      id: 1,
      sourceId: 1,
      targetId: 2,
    },
    {
      id: 2,
      sourceId: 2,
      targetId: 3,
    },
    {
      id: 3,
      sourceId: 1,
      targetId: 4,
    },
  ];

  it("targetDistance가 edge_distance의 0.7배 ~ 1.3배 이내여야한다.", () => {
    const baseDistance = GRAPH_NUMBER_CONSTANT.EDGE_DISTANCE;
    const minDistance = baseDistance * 0.7;
    const maxDistance = baseDistance * 1.3;

    const result = addRandomEdgeDistance(edges);
    result.forEach((edge) => {
      expect(edge.targetDistance).toBeGreaterThanOrEqual(minDistance);
      expect(edge.targetDistance).toBeLessThanOrEqual(maxDistance);
    });
  });

  it("순수함수이어야한다.", () => {
    const original = JSON.stringify(edges);
    addRandomEdgeDistance(edges);
    expect(JSON.stringify(edges)).toBe(original);
  });
});
