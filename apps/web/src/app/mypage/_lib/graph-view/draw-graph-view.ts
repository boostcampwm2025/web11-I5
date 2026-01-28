import hexToRgba from "@/lib/hex-to-rgba";
import {
  GRAPH_COLOR_CONSTANT,
  GRAPH_NUMBER_CONSTANT,
} from "../../_constants/graph-view-constant";
import { GraphEdge, NodeMapType, NodeType } from "../../_types/graph-view";

function getNodeColor(type: NodeType) {
  return type === NodeType.QUESTION
    ? GRAPH_COLOR_CONSTANT.QUESTION_NODE
    : GRAPH_COLOR_CONSTANT.KEYWORD_NODE;
}

// hex 색상을 RGB로 파싱
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// 두 색상을 t(0~1) 비율로 선형 보간하고 alpha 적용
function lerpColorWithAlpha(
  color1: string,
  color2: string,
  t: number,
  alpha: number,
): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawGraphView(
  ctx: CanvasRenderingContext2D,
  nodes: NodeMapType,
  edges: GraphEdge[],
  offset: { x: number; y: number } = { x: 0, y: 0 },
  scale: number = 1,
  hoveredNode: number | null,
  textRenderScale: number = 0.5,
) {
  ctx.save();
  ctx.translate(offset.x, offset.y);
  ctx.scale(scale, scale);

  // 줌 레벨에 따라 시각적 굵기를 min/max 범위 내로 유지
  const minVisualWidth = GRAPH_NUMBER_CONSTANT.MIN_EDGE_STROKE_WIDTH;
  const maxVisualWidth = GRAPH_NUMBER_CONSTANT.MAX_EDGE_STROKE_WIDTH;
  const baseWidth = GRAPH_NUMBER_CONSTANT.EDGE_STROKE_WIDTH;
  const clampedVisualWidth = Math.max(
    minVisualWidth,
    Math.min(baseWidth * scale, maxVisualWidth),
  );
  ctx.lineWidth = clampedVisualWidth / scale;

  edges.forEach((edge) => {
    const source = nodes.get(edge.sourceId);
    const target = nodes.get(edge.targetId);
    if (!source || !target) return;

    // 호버된 노드에 직접 연결된 엣지만 하이라이트
    const isDirectlyConnected =
      source.id === hoveredNode || target.id === hoveredNode;

    // 직접 연결된 경우만 하이라이트 강도 사용
    const edgeHighlight = isDirectlyConnected
      ? Math.max(source.displayHighlight, target.displayHighlight)
      : 0;

    // 3가지 상태에 따른 알파 계산
    // - Normal (hoveredNode === null): 0.5
    // - Active (직접 연결됨): 1.0
    // - Inactive (연결 안됨): NOT_HOVERED_ALPHA
    const NORMAL_EDGE_ALPHA = 0.5;
    const INACTIVE_ALPHA = GRAPH_COLOR_CONSTANT.NOT_HOVERED_ALPHA;

    let finalAlpha: number;
    if (hoveredNode === null) {
      // Normal 상태
      finalAlpha = NORMAL_EDGE_ALPHA;
    } else {
      // Active 또는 Inactive 상태
      // edgeHighlight로 Active(1.0)와 Inactive(0.2) 사이를 보간
      finalAlpha = INACTIVE_ALPHA + edgeHighlight * (1 - INACTIVE_ALPHA);
    }
    ctx.strokeStyle = lerpColorWithAlpha(
      GRAPH_COLOR_CONSTANT.EDGE,
      GRAPH_COLOR_CONSTANT.HOVERED,
      edgeHighlight,
      finalAlpha,
    );

    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
  });

  const fontFamily = window.getComputedStyle(document.body).fontFamily;
  ctx.font = `8px ${fontFamily}`;
  ctx.textAlign = "center";
  const textAlpha = Math.min(
    1,
    Math.max(0, (scale - textRenderScale) / textRenderScale),
  );
  nodes.forEach((node) => {
    const isHovered = node.id === hoveredNode;

    // displayRadius와 displayAlpha 사용 (애니메이션된 값)
    const radius = node.displayRadius;

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

    const nodeColor = isHovered
      ? GRAPH_COLOR_CONSTANT.HOVERED
      : getNodeColor(node.type);
    ctx.fillStyle = hexToRgba(nodeColor, node.displayAlpha);
    ctx.fill();

    if (textAlpha > 0) {
      const labelAlpha = node.displayAlpha * textAlpha;
      ctx.fillStyle = hexToRgba(GRAPH_COLOR_CONSTANT.LABEL, labelAlpha);
      ctx.fillText(node.label, node.x, node.y + radius + 10);
    }
  });

  ctx.restore();
}

export default drawGraphView;
