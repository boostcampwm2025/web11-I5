import { Delaunay, Voronoi } from "d3-delaunay";

function lloydRelaxation(
  voronoi: Voronoi<Delaunay.Point>,
  points: [number, number][],
) {
  const newPoints: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    const polygon = voronoi.cellPolygon(i);
    // 점이 일직선상 존재하거나 남은 점 2개 이하면 polygon = null
    if (polygon) {
      //polygon 중앙점 계산 및 point 이동
      let cx = 0,
        cy = 0;
      for (const [x, y] of polygon) {
        cx += x;
        cy += y;
      }
      cx /= polygon.length;
      cy /= polygon.length;

      newPoints.push([cx, cy]);
    }
  }
  return newPoints;
}

export default lloydRelaxation;
