import { Delaunay } from "d3-delaunay";
import { beforeAll, describe, expect, it } from "vitest";
import computeCells from "../../_lib/voronoi-streak/compute-cells";

// Path2D는 canvasAPI이기 때문에 Path2D가 제공되지 않아 이를 모킹
beforeAll(() => {
  global.Path2D = class MockPath2D {
    constructor(_path?: string | Path2D) {}
  } as unknown as typeof Path2D;
});

describe("computeCells 함수 test", () => {
  const canvasWidth = 2;
  const canvasHeight = 2;

  const mockImageData = new Uint8ClampedArray([
    255,
    0,
    0,
    255, // red (0, 0)
    0,
    255,
    0,
    255, // green (1, 0)
    0,
    0,
    255,
    255, // blue (0, 1)
    255,
    255,
    0,
    255, // yellow (1, 1)
  ]);

  const points: [number, number][] = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ];

  const clusters = [0, 1, 0, 1];

  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([0, 0, canvasWidth, canvasHeight]);

  it("각 셀에는 해당하는 색상이 매핑되어야한다", () => {
    const result = computeCells(
      points,
      voronoi,
      mockImageData,
      canvasWidth,
      canvasHeight,
      clusters,
    );

    expect(result[0].color).toBe("rgb(255,0,0)"); // red
    expect(result[1].color).toBe("rgb(0,255,0)"); // green
    expect(result[2].color).toBe("rgb(0,0,255)"); // blue
    expect(result[3].color).toBe("rgb(255,255,0)"); // yellow
  });

  it("svg 경로 문자열이 반환되어야한다", () => {
    const result = computeCells(
      points,
      voronoi,
      mockImageData,
      canvasWidth,
      canvasHeight,
      clusters,
    );

    result.forEach((cell, idx) => {
      expect(cell.path).toBeInstanceOf(Path2D);
      const pathString = voronoi.renderCell(idx);
      expect(pathString).toBeTruthy();
      expect(typeof pathString).toBe("string");
    });
  });

  it("cluster 정보가 올바르게 매핑되어야한다", () => {
    const result = computeCells(
      points,
      voronoi,
      mockImageData,
      canvasWidth,
      canvasHeight,
      clusters,
    );

    expect(result[0].cluster).toBe(0);
    expect(result[1].cluster).toBe(1);
    expect(result[2].cluster).toBe(0);
    expect(result[3].cluster).toBe(1);
  });
});
