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
}

/**
 * Renders an interactive canvas-based graph visualization for the provided graph data.
 *
 * The component mounts a canvas, attaches renderer event bindings and an optional wheel
 * zoom handler, and runs a per-frame draw loop. Node clicks navigate to `/reports/{id}`
 * unless `clickEventDisabled` is true. The canvas element includes role and dynamic
 * aria-label describing node and edge counts.
 *
 * @param graphData - Graph data containing `nodes` and `edges` to render
 * @param textRenderScale - Optional scale factor applied when rendering node/edge text
 * @param clickEventDisabled - If true, node click navigation is disabled
 * @param zoomEnabled - If true, binds the wheel handler to enable zooming (default: `true`)
 * @param showLabels - If true, node labels are rendered (default: `true`)
 * @param initialScale - Optional initial zoom scale for the graph view
 * @returns The canvas element that displays the interactive graph visualization
 */
function GraphView({
  graphData,
  textRenderScale,
  clickEventDisabled,
  zoomEnabled = true,
  showLabels = true,
  initialScale,
}: GraphViewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { ctx, getWidth, getHeight } = useCanvas2D(canvasRef);

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