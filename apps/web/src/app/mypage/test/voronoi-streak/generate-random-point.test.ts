import { describe, expect, it } from "vitest";
import { VORONOI_NUMBER_CONSTANT } from "../../_constants/voronoi-constant";
import generateRandomPoint from "../../_lib/voronoi-streak/generate-random-point";

describe("generateRandomPoint 함수 test", () => {
  it("여러번 반복에도 동일한 결과를 반환해야한다.", () => {
    const result1 = generateRandomPoint(100, 100);
    const result2 = generateRandomPoint(100, 100);
    expect(result1).toEqual(result2);
  });

  it("point는 PERIOD과 PERIOD_SCALE의 곱 연산 결과만큼 나와야한다.", () => {
    const PERIOD = VORONOI_NUMBER_CONSTANT.PERIOD;
    const SCALE = VORONOI_NUMBER_CONSTANT.PERIOD_POINT_SCALE;
    const result = generateRandomPoint(100, 100);
    expect(result.length).toBe(PERIOD * SCALE);
  });

  it("point의 좌표는 0 ~ 범위내에 위치해야한다.", () => {
    const canvasWidth = 100;
    const canvasHeight = 100;
    const result = generateRandomPoint(canvasWidth, canvasHeight);
    result.forEach(([x, y]) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(canvasWidth);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(canvasHeight);
    });
  });
});
