import { Delaunay } from "d3-delaunay";
import { describe, expect, it } from "vitest";
import lloydRelaxation from "../../_lib/voronoi-streak/lloyd-relaxation";

describe("lloyd 알고리즘 테스트", () => {
  const canvasWidth = 100;
  const canvasHeight = 100;

  it("points가 한 개만 전달되면 lloyd relaxation은 실행되지 않는다.", () => {
    const points: [number, number][] = [[10, 10]];
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, canvasWidth, canvasHeight]);

    const result = lloydRelaxation(voronoi, points);
    expect(result).toEqual(points);
  });

  it("lloyd 알고리즘을 테스트하였을 때 점들이 캔버스 내에 위치해야한다.", () => {
    const points: [number, number][] = [
      [10, 10],
      [20, 50],
      [50, 50],
      [80, 20],
      [90, 30],
    ];
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, canvasWidth, canvasHeight]);

    const result = lloydRelaxation(voronoi, points);
    result.forEach(([x, y]) => {
      expect(x).toBeLessThanOrEqual(canvasWidth);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(canvasHeight);
      expect(y).toBeGreaterThanOrEqual(0);
    });
  });

  it("lloyd 알고리즘을 적용하였을 때 점들이 더 균일하게 분포해야한다.", () => {
    // 극단적인 케이스: 점들이 왼쪽 위 구석에 몰려있는 경우
    const clusteredPoints: [number, number][] = [
      [5, 5],
      [10, 8],
      [8, 12],
      [15, 10],
      [12, 15],
    ];

    const distance = (p1: [number, number], p2: [number, number]) => {
      return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
    };

    const mean = (arr: number[]) => {
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    };

    const delaunay = Delaunay.from(clusteredPoints);
    const voronoi = delaunay.voronoi([0, 0, canvasWidth, canvasHeight]);

    // lloyd 적용 전: 각 점에서 가장 가까운 점까지의 평균 거리
    const getAvgMinDistance = (pts: [number, number][]) => {
      const minDistances = pts.map((p1, i) => {
        const distances = pts
          .filter((_, j) => i !== j)
          .map((p2) => distance(p1, p2));
        return Math.min(...distances);
      });
      return mean(minDistances);
    };

    const beforeAvg = getAvgMinDistance(clusteredPoints);

    // lloyd 적용 후
    const relaxedPoints = lloydRelaxation(voronoi, clusteredPoints);
    const afterAvg = getAvgMinDistance(relaxedPoints);

    // 점들이 더 퍼졌다면 평균 최소 거리가 증가해야 함
    expect(afterAvg).toBeGreaterThan(beforeAvg);
  });
});
