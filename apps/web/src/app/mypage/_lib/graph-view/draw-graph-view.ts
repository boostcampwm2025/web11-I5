import hexToRgba from "@/lib/hex-to-rgba";
import {
  GRAPH_COLOR_CONSTANT,
  GRAPH_NUMBER_CONSTANT,
} from "../../_constants/graph-view-constant";
import { GraphEdge, NodeMapType, NodeType } from "../../types/graph-view";

function getNodeColor(type: NodeType) {
  return type === NodeType.QUESTION
    ? GRAPH_COLOR_CONSTANT.QUESTION_NODE
    : GRAPH_COLOR_CONSTANT.KEYWORD_NODE;
}

function drawGraphView(
  ctx: CanvasRenderingContext2D,
  nodes: NodeMapType,
  edges: GraphEdge[],
  offset: { x: number; y: number } = { x: 0, y: 0 },
  scale: number = 1,
  hoveredNode: number | null,
) {
  ctx.save();
  ctx.translate(offset.x, offset.y);
  ctx.scale(scale, scale);

  const hoveredSet = new Set<number>();

  ctx.lineWidth = 1;
  edges.forEach((edge) => {
    const source = nodes.get(edge.sourceId);
    const target = nodes.get(edge.targetId);
    if (!source || !target) return;

    const isConnectedToHovered =
      source.id === hoveredNode || target.id === hoveredNode;
    const isDimmed = hoveredNode && !isConnectedToHovered;
    if (isConnectedToHovered) {
      ctx.strokeStyle = GRAPH_COLOR_CONSTANT.HOVERED;
      hoveredSet.add(source.id);
      hoveredSet.add(target.id);
    } else if (isDimmed) {
      ctx.strokeStyle = hexToRgba(
        GRAPH_COLOR_CONSTANT.EDGE,
        GRAPH_COLOR_CONSTANT.NOT_HOVERED_ALPHA,
      );
    } else {
      ctx.strokeStyle = hexToRgba(GRAPH_COLOR_CONSTANT.EDGE, 0.5);
    }

    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
  });

  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  nodes.forEach((node) => {
    const isHovered = node.id === hoveredNode;
    const isHighlighted = hoveredSet.has(node.id);
    const isDimmed = hoveredNode !== null && !isHovered && !isHighlighted;
    const radius = isHovered
      ? GRAPH_NUMBER_CONSTANT.NODE_RADIUS + 2
      : GRAPH_NUMBER_CONSTANT.NODE_RADIUS;

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

    const nodeColor = getNodeColor(node.type);
    ctx.fillStyle = isDimmed
      ? hexToRgba(nodeColor, GRAPH_COLOR_CONSTANT.NOT_HOVERED_ALPHA)
      : nodeColor;
    ctx.fill();

    ctx.fillStyle = isDimmed
      ? hexToRgba(
          GRAPH_COLOR_CONSTANT.LABEL,
          GRAPH_COLOR_CONSTANT.NOT_HOVERED_ALPHA,
        )
      : GRAPH_COLOR_CONSTANT.LABEL;
    if (scale > 0.5) ctx.fillText(node.label, node.x, node.y + radius + 14);
  });

  ctx.restore();
}

export default drawGraphView;
