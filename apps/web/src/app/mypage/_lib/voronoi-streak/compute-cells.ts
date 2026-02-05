import type { Delaunay, Voronoi } from "d3-delaunay";

function computeCells(
  points: [number, number][],
  voronoi: Voronoi<Delaunay.Point>,
  imageData: ImageDataArray,
  width: number,
  height: number,
  clusters: number[],
) {
  const computedCells = points.map((point, idx) => {
    // renderCell 실행시 canvasAPI 연동 안되어있으면 SVG path string이 return.
    const pathString = voronoi.renderCell(idx);
    // SVG path string을 사용해 canvas API에서 사용하는 경로를 선언
    const path = new Path2D(pathString);

    const [cx, cy] = point;
    // lloyd-relaxation을 통해 구성된 point 값을 정수로 바꿔서 픽셀 값을 구하기
    const px = Math.floor(cx);
    const py = Math.floor(cy);

    const safeX = Math.max(0, Math.min(width - 1, px));
    const safeY = Math.max(0, Math.min(height - 1, py));

    // Image Data에서 픽셀 데이터를 1차원 배열로 저장하기 때문에 2D좌표를 1D 픽셀 번호로 변환하는 부분
    const index = (safeY * width + safeX) * 4;

    // Image Data에서 픽셀 번호에 순서대로 R, G, B, A(alpha 투명도) 값이 저장된 부분 꺼내기
    const r = imageData[index];
    const g = imageData[index + 1];
    const b = imageData[index + 2];

    return {
      path,
      color: `rgb(${r},${g},${b})`,
      cluster: clusters[idx],
    };
  });
  return computedCells;
}

export default computeCells;
