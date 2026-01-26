export const GRAPH_NUMBER_CONSTANT = {
  NODE_RADIUS: 5,
  MIN_SCALE: 0.3,
  MAX_SCALE: 2.3,
  EDGE_DISTANCE: 100,
  VELOCITY_THRESHOLD: 0.05, // 기존 0.01에서 수렴 속도 빠르게 조정하기 위해 0.05 높임
  EDGE_STROKE_WIDTH: 2,
  MIN_EDGE_STROKE_WIDTH: 2, // 줌 아웃 시 최소 시각적 굵기 (픽셀 단위)
  MAX_EDGE_STROKE_WIDTH: 2, // 줌 인 시 최대 시각적 굵기 (픽셀 단위)
} as const;

export const GRAPH_COLOR_CONSTANT = {
  QUESTION_NODE: "#00b39e", // teal-600
  KEYWORD_NODE: "#525252", // slate-700
  EDGE: "#e1e1e1", // slate-400
  HOVERED: "#2dd4bf", // teal-400
  LABEL: "#393939",
  NOT_HOVERED_ALPHA: 0.2,
};

export const PHISICS_CONSTANT = {
  REPULSION: 2000, //척력 강도. 크면 더 멀리 밀어냄
  SPRING_STRENGTH: 0.1, //인력 강도. 크면 빨리 목표 자리로 옴
  DAMPING: 0.5, // 마찰력 강도. 프레임마다 속도에 곱해져서 느려지게
  MAX_SPEED: 3.0, //최대 속도
  CENTER_GRAVITY: 0.005, // 중앙중력강도. 화면 밖으로 흩어지는거 막기
} as const;
