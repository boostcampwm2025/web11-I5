import * as React from "react";
import { GRAPH_NUMBER_CONSTANT } from "../../_constants/graph-view-constant";
import { GraphNode, NodePosition } from "../../_types/graph-view";

export interface GraphInteractionCallbacks {
  getNodeValues: () => IterableIterator<GraphNode & NodePosition>;
  setNodeFixedCoords: (nodeId: number, x: number, y: number) => void;
  clearNodeFixedCoords: (nodeId: number) => void;
  getNodeQuestionId: (nodeId: number) => number | null;
}

function useGraphInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  clickEventDisabled: boolean = false,
  callbacks: GraphInteractionCallbacks,
  initialOffset: { x: number; y: number } = { x: 0, y: 0 },
  initialScale: number = 1,
) {
  // 콜백들을 ref로 관리하여 인라인 콜백이 변경되어도 핸들러들이 재생성되지 않도록 함
  const callbacksRef = React.useRef(callbacks);
  React.useEffect(() => {
    callbacksRef.current = callbacks;
  });

  // offset: canvas가 얼마나 움직였는지 확인하는 변수
  // ex) 초기 0,0 -> 캔버스내에서 움직임으로 오른쪽 100px, 아래로 10px 움직이면 x: 100, y: 10
  const offset = React.useRef(initialOffset);

  // scale: 캔버스에서 휠움직임을 통해 줌을 할 때 줌 단계
  const scale = React.useRef(initialScale);

  const hoveredNodeId = React.useRef<number | null>(null);
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // interaction 진행중인지 상태 확인 (드래그, 휠 등)
  const [activeInteraction, setActiveInteraction] = React.useState(false);
  // wheelTimeoutRef: 휠 이벤트 종료를 감지하기 위한 debounce 타이머
  const wheelTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // isDraggingCanvas: 캔버스를 드래그중인지 여부
  const [isDraggingCanvas, setIsDraggingCanvas] = React.useState(false);
  // dragStartOffset: 드래그 시작시 마우스 위치 (프레임간 이동량 계산용)
  const [dragStartOffset, setDragStartOffset] = React.useState({ x: 0, y: 0 });
  // draggedNodeId: 현재 드래그중인 노드의 ID (null이면 노드 드래그 중이 아님)
  const [draggedNodeId, setDraggedNodeId] = React.useState<number | null>(null);

  // 스크린의 마우스 좌표 -> 캔버스 내의 좌표로 변환 함수
  const convertCursorToCanvasCoords = React.useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();

      // 1. screenX - rect.left => 화면좌표 - 캔버스 좌표
      // 2. - offset.x / -offset.y => 이동한 만큼 빼주기
      // 3. /scale => 줌 한만큼 나눠서 원래 좌표 위치 찾기
      const x = (screenX - rect.left - offset.current.x) / scale.current;
      const y = (screenY - rect.top - offset.current.y) / scale.current;
      return { x, y };
    },
    [canvasRef, offset, scale],
  );

  // 캔버스 내의 좌표에서 해당하는 노드가 있는지 확인하고, 있으면 해당 node 리턴
  const findNodeAtPosition = React.useCallback(
    (graphX: number, graphY: number) => {
      // 모든 노드를 순회하며 클릭된 위치에 노드가 있는지 확인
      for (const node of callbacksRef.current.getNodeValues()) {
        const dx = graphX - node.x;
        const dy = graphY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        //노드 반지름 + 5해서 노드 보다 조금 넓은 범위 클릭하면 선택할 수 있게
        if (distance <= GRAPH_NUMBER_CONSTANT.NODE_RADIUS + 5) {
          return node;
        }
      }
    },
    [],
  );

  // 클릭 이벤트
  // 기대동작 1. 노드 클릭 x -> dragStartOffset에 현재 마우스 좌표 값 저장 & 드래그 상태 저장
  // 기대동작 2. 노드 클릭 o -> 해당 노드 고정
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setActiveInteraction(true);
      // 클릭 판정을 위해 항상 시작 위치 저장
      setDragStartOffset({ x: e.clientX, y: e.clientY });

      const { x, y } = convertCursorToCanvasCoords(e.clientX, e.clientY);
      const clickedNode = findNodeAtPosition(x, y);

      if (clickedNode) {
        setDraggedNodeId(clickedNode.id);
        // 드래그시 해당 노드 고정 -> fx, fy 에 값이 들어가면 노드 움직이지 않게 하기
        callbacksRef.current.setNodeFixedCoords(clickedNode.id, x, y);
      } else {
        setIsDraggingCanvas(true);
      }
    },
    [convertCursorToCanvasCoords, findNodeAtPosition],
  );

  // 드래그 이벤트 (마우스 움직임)
  // 기대동작 1. 노드 드래그중 -> 해당 노드를 마우스 위치로 이동
  // 기대동작 2. 캔버스 드래그중 -> 마우스 이동량만큼 캔버스 offset 업데이트
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = convertCursorToCanvasCoords(e.clientX, e.clientY);

      if (draggedNodeId !== null) {
        callbacksRef.current.setNodeFixedCoords(draggedNodeId, x, y);
      } else if (isDraggingCanvas) {
        const dx = e.clientX - dragStartOffset.x;
        const dy = e.clientY - dragStartOffset.y;

        offset.current.x += dx;
        offset.current.y += dy;

        setDragStartOffset({ x: e.clientX, y: e.clientY });
      } else {
        const hoveredNode = findNodeAtPosition(x, y);
        const newHoveredId = hoveredNode?.id ?? null;

        // 호버 상태가 변경되었을 때만 리렌더링 트리거
        if (hoveredNodeId.current !== newHoveredId) {
          hoveredNodeId.current = newHoveredId;
          setActiveInteraction(true);
          // 짧은 딜레이 후 interaction 상태 해제
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = setTimeout(
            () => setActiveInteraction(false),
            50,
          );
        }
      }
    },
    [
      convertCursorToCanvasCoords,
      dragStartOffset,
      draggedNodeId,
      isDraggingCanvas,
      offset,
      findNodeAtPosition,
    ],
  );

  // 마우스 클릭 해제 이벤트
  // 기대동작 1. 노드 드래그중이었다면 -> 노드 고정 해제 (fx, fy를 null로 설정)
  // 기대동작 2. 모든 드래그 상태 초기화
  const handleMouseUp = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const clickedNodeId = draggedNodeId;
      if (draggedNodeId !== null) {
        callbacksRef.current.clearNodeFixedCoords(draggedNodeId);
      }

      setDraggedNodeId(null);
      setIsDraggingCanvas(false);
      setActiveInteraction(false);

      // 클릭 이벤트 처리 (드래그 없이 같은 위치에서 마우스 업)
      if (dragStartOffset.x === e.clientX && dragStartOffset.y === e.clientY) {
        if (clickEventDisabled || !clickedNodeId) return;
        const questionId =
          callbacksRef.current.getNodeQuestionId(clickedNodeId);
        if (!questionId) return;
        window.open(`/reports/${questionId}`);
      }
    },
    [clickEventDisabled, draggedNodeId, dragStartOffset],
  );

  // 휠 이벤트 리스너 등록 (줌 인/아웃 기능)
  // 기대동작: 마우스 휠을 움직이면 마우스 위치를 기준으로 줌 인/아웃 처리
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setActiveInteraction(true);

      const { offsetX, offsetY, deltaY } = e;
      const scaleAmount = -deltaY * 0.001;
      const newScale = Math.max(
        GRAPH_NUMBER_CONSTANT.MIN_SCALE,
        Math.min(GRAPH_NUMBER_CONSTANT.MAX_SCALE, scale.current + scaleAmount),
      );

      // 마우스 위치에 따라 해당 마우스에서 스케일 조정
      const mouseX = offsetX - offset.current.x;
      const mouseY = offsetY - offset.current.y;

      offset.current.x -= (mouseX / scale.current) * (newScale - scale.current);
      offset.current.y -= (mouseY / scale.current) * (newScale - scale.current);

      scale.current = newScale;

      // wheel 이벤트 종료 감지를 위한 debounce
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      wheelTimeoutRef.current = setTimeout(() => {
        setActiveInteraction(false);
      }, 100);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef]);

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return {
    offset,
    scale,
    hoveredNodeId,
    activeInteraction,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}

export default useGraphInteraction;
