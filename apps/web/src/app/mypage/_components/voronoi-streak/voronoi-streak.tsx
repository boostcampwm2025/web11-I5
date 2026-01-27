"use client";

import { useCanvas2D } from "@/hooks/use-canvas-2d";
import { Delaunay } from "d3-delaunay";
import { randomLcg } from "d3-random";
import * as React from "react";
import skmeans from "skmeans";
import {
  VORONOI_COLOR_CONSTANT,
  VORONOI_NUMBER_CONSTANT,
} from "../../_constants/voronoi-constant";
import computeCells from "../../_lib/compute-cells";
import generateRandomPoint from "../../_lib/generate-random-point";
import lloydRelaxation from "../../_lib/lloyd-relaxation";
import { YearlyAnswerSubmissions } from "../../_types/streak";

interface VoronoiStreakProps {
  streakCount: number;
  imageSrc: string;
  yearlyAnswerSubmissions: YearlyAnswerSubmissions[];
}

interface CellData {
  path: Path2D;
  color: string;
  cluster: number;
}

function VoronoiStreak({
  streakCount,
  imageSrc,
  yearlyAnswerSubmissions,
}: VoronoiStreakProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { width, height } = useCanvas2D(canvasRef);
  const [cellData, setCellData] = React.useState<CellData[]>([]);
  // 가까운 cell을 찾기 위한 delaunay ref 저장
  const delaunayRef = React.useRef<Delaunay<Delaunay.Point> | null>(null);
  const [hoveredInfo, setHoveredInfo] = React.useState<{
    x: number;
    y: number;
    submission: YearlyAnswerSubmissions;
  } | null>(null);

  React.useEffect(() => {
    if (!imageSrc || width === 0 || height === 0) return;

    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(image, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height).data;

      let points = generateRandomPoint(width, height);
      const tempDelaunay = Delaunay.from(points);
      const tempVoronoi = tempDelaunay.voronoi([0, 0, width, height]);

      for (
        let i = 0;
        i < VORONOI_NUMBER_CONSTANT.NUMBER_OF_LLOYD_ATTEMPTS;
        i++
      ) {
        points = lloydRelaxation(tempVoronoi, points);
        tempVoronoi.update();
      }

      // K-Means 기반 클러스터링 진행 (seed 기반 초기 centroids로 결과 고정)
      const lcg = randomLcg(VORONOI_NUMBER_CONSTANT.SEED);
      const initialCentroids: [number, number][] = [];
      for (let i = 0; i < VORONOI_NUMBER_CONSTANT.PERIOD; i++) {
        const idx = Math.floor(lcg() * points.length);
        initialCentroids.push(points[idx]);
      }
      const clusterResult = skmeans(
        points,
        VORONOI_NUMBER_CONSTANT.PERIOD,
        initialCentroids,
      );
      const pointsWithCluster = points.map((point, idx) => ({
        point,
        cluster: clusterResult.idxs[idx],
      }));
      pointsWithCluster.sort((a, b) => a.cluster - b.cluster);
      points = pointsWithCluster.map((p) => p.point);
      const clusters = pointsWithCluster.map((p) => p.cluster);

      const delaunay = Delaunay.from(points);
      delaunayRef.current = delaunay;
      const voronoi = delaunay.voronoi([0, 0, width, height]);
      const computedCells = computeCells(
        points,
        voronoi,
        imageData,
        width,
        height,
        clusters,
      );
      setCellData(computedCells);
    };
  }, [imageSrc, width, height]);

  React.useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || cellData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      cellData.forEach((cell) => {
        ctx.beginPath();

        if (cell.cluster < streakCount) {
          ctx.fillStyle = cell.color;
          ctx.strokeStyle = cell.color;
        } else {
          ctx.fillStyle = VORONOI_COLOR_CONSTANT.GRAY;
          ctx.strokeStyle = VORONOI_COLOR_CONSTANT.WHITE;
        }

        ctx.fill(cell.path);
        ctx.lineWidth = 0.5;
        ctx.stroke(cell.path);
      });
    };

    const animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cellData, streakCount, width, height]);

  // 마우스가 위치한 cell이면서 색이 칠해졌을 때 -> 문제 정보 & 풀이 시간 보일 수 있게 수정
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current || !delaunayRef.current || cellData.length === 0)
        return;
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      const closeDelaunayIdx = delaunayRef.current.find(canvasX, canvasY);
      const cluster = cellData[closeDelaunayIdx].cluster;
      const submission = yearlyAnswerSubmissions[cluster];

      if (cluster < streakCount && submission) {
        setHoveredInfo({ x: canvasX, y: canvasY, submission });
      } else {
        setHoveredInfo(null);
      }
    },
    [cellData, yearlyAnswerSubmissions, streakCount],
  );

  const handleMouseLeave = React.useCallback(() => {
    setHoveredInfo(null);
  }, []);

  const convertDateString = (submittedAt: string) => {
    const date = new Date(submittedAt);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <div
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas className="w-full h-full" ref={canvasRef} />
      {hoveredInfo && (
        <div
          className="absolute z-10 bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2"
          style={{ left: hoveredInfo.x + 5, top: hoveredInfo.y + 10 }}
        >
          <p className="text-sm font-semibold text-teal-500">
            {hoveredInfo.submission.title}
          </p>
          <p className="text-xs text-slate-700">
            {convertDateString(hoveredInfo.submission.submittedAt)}
          </p>
        </div>
      )}
    </div>
  );
}

export default VoronoiStreak;
