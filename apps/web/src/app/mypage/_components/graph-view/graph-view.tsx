"use client";

import { useCanvas2D } from "@/hooks/use-canvas-2d";
import useAnimationFrame from "@/hooks/use-animation-frame";
import * as React from "react";
import { GraphData } from "../../_types/graph-view";
import useGraphRenderer from "./use-graph-renderer";

interface GraphViewProps {
  graphData: GraphData;
  textRenderScale?: number;
  clickEventDisabled?: boolean;
  zoomEnabled?: boolean;
  showLabels?: boolean;
  initialScale?: number;
  scale?: number;
  onScaleChange?: (scale: number) => void;
  /** 이 제출에서 추가된 노드·엣지 ID (기존 그래프 위에 하이라이트) */
  highlightNodeIds?: number[];
  highlightEdgeIds?: number[];
}

function GraphView({
  graphData,
  textRenderScale,
  clickEventDisabled,
  zoomEnabled = true,
  showLabels = true,
  initialScale,
  scale,
  onScaleChange,
  highlightNodeIds,
  highlightEdgeIds,
}: GraphViewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { ctx, getWidth, getHeight } = useCanvas2D(canvasRef);

  const highlight = React.useMemo(() => {
    if (highlightNodeIds == null && highlightEdgeIds == null) {
      return null;
    }
    return {
      nodeIds: new Set(highlightNodeIds ?? []),
      edgeIds: new Set(highlightEdgeIds ?? []),
    };
  }, [highlightNodeIds, highlightEdgeIds]);

  const { bindEvents, bindWheelEvent, drawGraph } = useGraphRenderer({
    canvasRef,
    ctx,
    getWidth,
    getHeight,
    graphData,
    onClickNode: clickEventDisabled
      ? undefined
      : (questionId) => window.open(`/reports/${questionId}`),
    textRenderScale,
    showLabels,
    initialScale,
    scale,
    onScaleChange,
    highlight,
  });

  // 휠 이벤트 바인딩 (passive: false 필요)
  React.useEffect(() => {
    if (!zoomEnabled) return;
    return bindWheelEvent();
  }, [bindWheelEvent, zoomEnabled]);

  // 애니메이션 루프
  useAnimationFrame(drawGraph);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      role="img"
      aria-label={`지식 그래프: ${graphData.nodes.length}개의 질문, ${graphData.edges.length}개의 연결`}
      {...bindEvents}
    />
  );
}

export default GraphView;
