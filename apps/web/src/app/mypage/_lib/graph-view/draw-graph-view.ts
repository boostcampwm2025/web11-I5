import hexToRgba from "@/lib/hex-to-rgba";
import {
  GRAPH_COLOR_CONSTANT,
  GRAPH_NUMBER_CONSTANT,
} from "../../_constants/graph-view-constant";
import { GraphEdge, NodeMapType, NodeType } from "../../_types/graph-view";
import lerpColorWithAlpha from "@/lib/lerp-color-with-alpha";

function getNodeColor(type: NodeType) {
  return type === NodeType.QUESTION
    ? GRAPH_COLOR_CONSTANT.QUESTION_NODE
    : GRAPH_COLOR_CONSTANT.KEYWORD_NODE;
}

/** 하이라이트용: 이 제출에서 추가된 노드·엣지만 강조할 때 사용 */
export interface GraphHighlightSets {
  nodeIds: Set<number>;
  edgeIds: Set<number>;
}

function drawGraphView(
  ctx: CanvasRenderingContext2D,
  nodes: NodeMapType,
  edges: GraphEdge[],
  offset: { x: number; y: number } = { x: 0, y: 0 },
  scale: number = 1,
  hoveredNode: number | null,
  textRenderScale: number = 0.5,
  showLabels: boolean = true,
  highlight: GraphHighlightSets | null = null,
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

  const isEdgeHighlighted = (edgeId: number) =>
    highlight != null && highlight.edgeIds.has(edgeId);

  edges.forEach((edge) => {
    const source = nodes.get(edge.sourceId);
    const target = nodes.get(edge.targetId);
    if (!source || !target) return;

    // 호버된 노드에 직접 연결된 엣지 또는 제출 하이라이트
    const isDirectlyConnected =
      source.id === hoveredNode || target.id === hoveredNode;
    const isSubmissionHighlight = isEdgeHighlighted(edge.id);

    const edgeHighlight = isSubmissionHighlight
      ? 1
      : isDirectlyConnected
        ? Math.max(source.displayHighlight, target.displayHighlight)
        : 0;

    const NORMAL_EDGE_ALPHA = 0.5;
    const INACTIVE_ALPHA = GRAPH_COLOR_CONSTANT.NOT_HOVERED_ALPHA;

    let finalAlpha: number;
    if (highlight != null) {
      // 하이라이트 모드: 제출에서 추가된 엣지는 진하게, 나머지는 흐리게
      finalAlpha = isSubmissionHighlight ? 0.9 : INACTIVE_ALPHA;
    } else if (hoveredNode === null) {
      finalAlpha = NORMAL_EDGE_ALPHA;
    } else {
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
  const isNodeHighlighted = (nodeId: number) =>
    highlight != null && highlight.nodeIds.has(nodeId);

  nodes.forEach((node) => {
    const isHovered = node.id === hoveredNode;
    const isSubmissionHighlight = isNodeHighlighted(node.id);

    const radius = node.displayRadius;

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

    let nodeColor = isHovered
      ? GRAPH_COLOR_CONSTANT.HOVERED
      : getNodeColor(node.type);
    if (isSubmissionHighlight && !isHovered) {
      nodeColor = GRAPH_COLOR_CONSTANT.HOVERED;
    }
    const alpha =
      highlight != null
        ? isSubmissionHighlight
          ? 1
          : GRAPH_COLOR_CONSTANT.NOT_HOVERED_ALPHA
        : node.displayAlpha;
    const nodeRgba = hexToRgba(nodeColor, alpha);
    ctx.fillStyle = `rgba(${nodeRgba.r}, ${nodeRgba.g}, ${nodeRgba.b}, ${nodeRgba.a})`;
    ctx.fill();

    if (showLabels && textAlpha > 0) {
      const labelAlpha = alpha * textAlpha;
      const labelRgba = hexToRgba(GRAPH_COLOR_CONSTANT.LABEL, labelAlpha);
      ctx.fillStyle = `rgba(${labelRgba.r}, ${labelRgba.g}, ${labelRgba.b}, ${labelRgba.a})`;
      ctx.fillText(node.label, node.x, node.y + radius + 10);
    }
  });

  ctx.restore();
}

export default drawGraphView;
