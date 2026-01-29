import * as React from "react";
import { GRAPH_NUMBER_CONSTANT } from "../../_constants/graph-view-constant";
import {
  GraphData,
  GraphEdge,
  GraphNode,
  NodePosition,
} from "../../_types/graph-view";
import NodeMap from "./node-map";
import drawGraphView from "../../_lib/graph-view/draw-graph-view";
import { addRandomEdgeDistance } from "../../_lib/graph-view/add-random-edge-distance";

// 호버된 노드와 연결된 모든 노드 ID를 반환
function getConnectedNodeIds(
  hoveredNodeId: number | null,
  edges: GraphEdge[],
): Set<number> {
  const connected = new Set<number>();
  if (hoveredNodeId === null) return connected;

  connected.add(hoveredNodeId);
  for (const edge of edges) {
    if (edge.sourceId === hoveredNodeId) {
      connected.add(edge.targetId);
    } else if (edge.targetId === hoveredNodeId) {
      connected.add(edge.sourceId);
    }
  }
  return connected;
}

export interface UseGraphRendererOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ctx: CanvasRenderingContext2D | null;
  getWidth: () => number;
  getHeight: () => number;
  graphData: GraphData;
  nodeMap?: NodeMap;
  onNodeMapChange?: (map: NodeMap) => void;
  onClickNode?: (questionId: number) => void;
  textRenderScale?: number;
}

export interface GraphRendererReturn {
  bindEvents: {
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseLeave: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  };
  bindWheelEvent: () => () => void;
  drawGraph: (deltaTime: number) => void;
}

// 물리엔진 미리 동작 횟수
const PRE_SIMULATION_ITERATIONS = 80;

function useGraphRenderer({
  canvasRef,
  ctx,
  getWidth,
  getHeight,
  graphData,
  nodeMap: externalNodeMap,
  onNodeMapChange,
  onClickNode,
  textRenderScale = 0.5,
}: UseGraphRendererOptions): GraphRendererReturn {
  // 엣지에 랜덤 거리 적용 (한 번만 계산)
  const processedEdges = React.useMemo(
    () => addRandomEdgeDistance(graphData.edges),
    [graphData.edges],
  );

  // 뷰포트 상태 - 초기 스케일 0.5
  const offset = React.useRef({ x: 0, y: 0 });
  const scale = React.useRef(0.5);
  const initializedOffset = React.useRef(false);

  // 인터랙션 상태
  const isDraggingCanvas = React.useRef(false);
  const draggedNodeId = React.useRef<number | null>(null);
  const dragStart = React.useRef({ x: 0, y: 0 });
  const hoveredNodeId = React.useRef<number | null>(null);

  // NodeMap 관리
  const nodeMapRef = React.useRef<NodeMap | null>(externalNodeMap || null);

  // NodeMap 변경 콜백 throttle 용
  const shouldNotify = React.useRef(true);

  // NodeMap 초기화 및 물리엔진 미리 동작
  React.useEffect(() => {
    const width = getWidth();
    const height = getHeight();
    if (width === 0 || height === 0) return;
    if (externalNodeMap || nodeMapRef.current) return;

    const newNodeMap = new NodeMap(graphData.nodes, width, height);

    // 물리엔진 미리 동작 - 렌더링 전에 안정화
    for (let i = 0; i < PRE_SIMULATION_ITERATIONS; i++) {
      newNodeMap.applyPhysics(processedEdges, width / 2, height / 2);
    }

    nodeMapRef.current = newNodeMap;
  }, [getWidth, getHeight, graphData.nodes, externalNodeMap, processedEdges]);

  // 초기 스케일이 0.5일 때 중앙 정렬을 위한 offset 조정
  React.useEffect(() => {
    if (initializedOffset.current) return;
    const width = getWidth();
    const height = getHeight();
    if (width === 0 || height === 0) return;

    offset.current = {
      x: (width * (1 - scale.current)) / 2,
      y: (height * (1 - scale.current)) / 2,
    };
    initializedOffset.current = true;
  }, [getWidth, getHeight]);

  // 스크린 좌표 -> 캔버스 좌표 변환
  const convertCursorToCanvasCoords = React.useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x = (screenX - rect.left - offset.current.x) / scale.current;
      const y = (screenY - rect.top - offset.current.y) / scale.current;
      return { x, y };
    },
    [canvasRef],
  );

  // 좌표에서 노드 찾기
  const findNodeAtPosition = React.useCallback(
    (
      graphX: number,
      graphY: number,
    ): (GraphNode & NodePosition) | undefined => {
      if (!nodeMapRef.current) return undefined;

      for (const node of nodeMapRef.current.getNodeValues()) {
        const dx = graphX - node.x;
        const dy = graphY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= GRAPH_NUMBER_CONSTANT.NODE_RADIUS + 10) {
          return node;
        }
      }
      return undefined;
    },
    [],
  );

  // 마우스 다운 핸들러
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      dragStart.current = { x: e.clientX, y: e.clientY };

      const { x, y } = convertCursorToCanvasCoords(e.clientX, e.clientY);
      const clickedNode = findNodeAtPosition(x, y);

      if (clickedNode) {
        draggedNodeId.current = clickedNode.id;
        nodeMapRef.current?.setNodeFixedCoords(clickedNode.id, x, y);
      } else {
        isDraggingCanvas.current = true;
      }
    },
    [convertCursorToCanvasCoords, findNodeAtPosition],
  );

  // 마우스 무브 핸들러
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = convertCursorToCanvasCoords(e.clientX, e.clientY);

      if (draggedNodeId.current !== null) {
        nodeMapRef.current?.setNodeFixedCoords(draggedNodeId.current, x, y);
      } else if (isDraggingCanvas.current) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        offset.current.x += dx;
        offset.current.y += dy;

        dragStart.current = { x: e.clientX, y: e.clientY };
      } else {
        const hoveredNode = findNodeAtPosition(x, y);
        hoveredNodeId.current = hoveredNode?.id ?? null;
      }
    },
    [convertCursorToCanvasCoords, findNodeAtPosition],
  );

  // 마우스 업 핸들러
  const handleMouseUp = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const clickedNodeId = draggedNodeId.current;

      if (draggedNodeId.current !== null) {
        nodeMapRef.current?.clearNodeFixedCoords(draggedNodeId.current);
      }

      // 클릭 이벤트 처리 (드래그 없이 같은 위치에서 마우스 업)
      if (
        dragStart.current.x === e.clientX &&
        dragStart.current.y === e.clientY &&
        clickedNodeId !== null &&
        onClickNode
      ) {
        const questionId =
          nodeMapRef.current?.getNode(clickedNodeId)?.questionId;
        if (questionId) {
          onClickNode(questionId);
        }
      }

      draggedNodeId.current = null;
      isDraggingCanvas.current = false;
    },
    [onClickNode],
  );

  // 휠 이벤트 바인딩
  const bindWheelEvent = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const { offsetX, offsetY, deltaY } = e;
      const scaleAmount = -deltaY * 0.001;
      const newScale = Math.max(
        GRAPH_NUMBER_CONSTANT.MIN_SCALE,
        Math.min(GRAPH_NUMBER_CONSTANT.MAX_SCALE, scale.current + scaleAmount),
      );

      const mouseX = offsetX - offset.current.x;
      const mouseY = offsetY - offset.current.y;

      offset.current.x -= (mouseX / scale.current) * (newScale - scale.current);
      offset.current.y -= (mouseY / scale.current) * (newScale - scale.current);

      scale.current = newScale;
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef]);

  // drawGraph 함수
  const drawGraph = React.useCallback(
    (_deltaTime: number) => {
      if (!ctx) return;

      const width = getWidth();
      const height = getHeight();
      if (width === 0 || height === 0) return;

      // NodeMap 초기화: externalNodeMap이 있으면 사용, 없으면 새로 생성
      if (externalNodeMap) {
        nodeMapRef.current = externalNodeMap;
      } else if (!nodeMapRef.current) {
        const newNodeMap = new NodeMap(graphData.nodes, width, height);
        // 물리엔진 미리 동작
        for (let i = 0; i < PRE_SIMULATION_ITERATIONS; i++) {
          newNodeMap.applyPhysics(processedEdges, width / 2, height / 2);
        }
        nodeMapRef.current = newNodeMap;
      }
      if (!nodeMapRef.current) return;

      // 물리 시뮬레이션 한 스텝
      nodeMapRef.current.applyPhysics(processedEdges, width / 2, height / 2);

      // 호버 애니메이션 업데이트
      const connectedNodeIds = getConnectedNodeIds(
        hoveredNodeId.current,
        processedEdges,
      );
      nodeMapRef.current.updateAnimations(
        hoveredNodeId.current,
        connectedNodeIds,
      );

      // 캔버스 클리어 & 그리기
      ctx.clearRect(0, 0, width, height);
      drawGraphView(
        ctx,
        nodeMapRef.current.nodeMap,
        processedEdges,
        offset.current,
        scale.current,
        hoveredNodeId.current,
        textRenderScale,
      );

      // NodeMap 변경 콜백 (throttle 처리 - 100ms 마다)
      if (onNodeMapChange && shouldNotify.current) {
        onNodeMapChange(nodeMapRef.current);
        shouldNotify.current = false;
        setTimeout(() => {
          shouldNotify.current = true;
        }, 100);
      }
    },
    [
      ctx,
      getWidth,
      getHeight,
      graphData.nodes,
      processedEdges,
      externalNodeMap,
      textRenderScale,
      onNodeMapChange,
    ],
  );

  const bindEvents = React.useMemo(
    () => ({
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    }),
    [handleMouseDown, handleMouseMove, handleMouseUp],
  );

  return {
    bindEvents,
    bindWheelEvent,
    drawGraph,
  };
}

export default useGraphRenderer;
