import { randomLcg } from "d3-random";
import { VORONOI_NUMBER_CONSTANT } from "../../_constants/voronoi-constant";

function generateRandomPoint(width: number, height: number) {
  const lcg = randomLcg(VORONOI_NUMBER_CONSTANT.SEED);
  const points: [number, number][] = [];

  for (
    let i = 0;
    i <
    VORONOI_NUMBER_CONSTANT.PERIOD * VORONOI_NUMBER_CONSTANT.PERIOD_POINT_SCALE;
    i++
  ) {
    const point = [lcg() * width, lcg() * height] as [number, number];
    points.push(point);
  }
  return points;
}

export default generateRandomPoint;
