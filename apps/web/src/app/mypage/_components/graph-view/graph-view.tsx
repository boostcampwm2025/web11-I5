"use client";
import { useCanvas2D } from "@/hooks/use-canvas-2d";
import * as React from "react";
import drawGraphView from "../../_lib/graph-view/draw-graph-view";
import { GraphData } from "../../_types/graph-view";
import NodeMap from "./node-map";
import useGraphInteraction from "./use-graph-interaction";
interface GraphViewProps {
  graphData: GraphData;
  textRenderScale?: number;
  clickEventDisabled?: boolean;
}
function GraphView({
  graphData,
  textRenderScale,
  clickEventDisabled,
}: GraphViewProps) {
  // canvasRef: Canvas DOM 참조
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  // ctx: Canvas 2D 렌더링 컨텍스트, width/height: 캔버스 크기
  const { ctx, width, height } = useCanvas2D(canvasRef);

  // nodeMapRef: NodeMap 인스턴스를 관리하는 ref
  const nodeMapRef = React.useRef<NodeMap | null>(null);

  // NodeMap 초기화 (캔버스 크기나 노드 데이터가 변경될 때만 재생성)
  React.useEffect(() => {
    if (width === 0 || height === 0) return;
    nodeMapRef.current = new NodeMap(graphData.nodes, width, height);
  }, [width, height, graphData.nodes]);

  // 캔버스 인터랙션 훅에서 반환된 값들
  // offset: 캔버스 이동 오프셋, scale: 줌 레벨
  // activeInteraction: 인터랙션 진행 여부 (드래그, 휠 등)
  // handleMouseDown/Move/Up: 마우스 이벤트 핸들러
  const {
    offset,
    scale,
    hoveredNodeId,
    activeInteraction,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useGraphInteraction(canvasRef, clickEventDisabled, {
    getNodeValues: () => nodeMapRef.current?.getNodeValues() ?? [].values(),
    setNodeFixedCoords: (nodeId, x, y) =>
      nodeMapRef.current?.setNodeFixedCoords(nodeId, x, y),
    clearNodeFixedCoords: (nodeId) =>
      nodeMapRef.current?.clearNodeFixedCoords(nodeId),
    getNodeQuestionId: (nodeId) =>
      nodeMapRef?.current?.nodeMap.get(nodeId)?.questionId ?? null,
  });

  // 물리 엔진 기반 그래프 애니메이션 루프
  // 기대동작: 물리 시뮬레이션을 통해 노드들이 안정적인 위치로 이동하며, 수렴 또는 인터랙션이 있을 때만 애니메이션 실행
  React.useEffect(() => {
    if (!ctx || width === 0 || height === 0 || !nodeMapRef.current) return;

    let animationId: number;
    const centerX = width / 2;
    const centerY = height / 2;

    // simulate: 각 프레임마다 실행되는 물리 시뮬레이션 및 렌더링 함수
    const simulate = () => {
      if (!nodeMapRef.current) return;

      // 1. 물리 엔진 단계: 힘 적용 및 위치 업데이트
      nodeMapRef.current.applyPhysics(graphData.edges, centerX, centerY);

      // 2. 렌더링 단계: 캔버스 지우고 그래프 그리기
      ctx.clearRect(0, 0, width, height);
      drawGraphView(
        ctx,
        nodeMapRef.current.nodeMap,
        graphData.edges,
        offset.current,
        scale.current,
        hoveredNodeId.current,
        textRenderScale,
      );

      // 3. 애니메이션 지속 조건 확인
      // 모든 노드의 속도가 0이면 수렴한 것으로 판단
      const isStable = nodeMapRef.current.checkStable();
      // 수렴하지 않았거나 사용자 인터랙션이 있으면 애니메이션 계속
      if (!isStable || activeInteraction) {
        animationId = requestAnimationFrame(simulate);
      }
    };

    animationId = requestAnimationFrame(simulate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    ctx,
    width,
    height,
    graphData.edges,
    offset,
    scale,
    activeInteraction,
    hoveredNodeId,
    textRenderScale,
  ]);

  return (
    // Canvas 엘리먼트에 마우스 이벤트 핸들러 바인딩
    // onMouseDown: 드래그 시작 (노드 또는 캔버스)
    // onMouseMove: 드래그 중 움직임 처리
    // onMouseUp: 드래그 종료
    // onMouseLeave: 캔버스 밖으로 나갈 때 드래그 종료 (마우스 업과 동일한 처리)
    <canvas
      className="w-full h-full rounded-md border border-gray-300 "
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    ></canvas>
  );
}

export default GraphView;
