import hexToRgba from "./hex-to-rgba";

// 두 색상을 t(0~1) 비율로 선형 보간하고 alpha 적용
function lerpColorWithAlpha(
  color1: string,
  color2: string,
  t: number,
  alpha: number,
): string {
  const c1 = hexToRgba(color1, alpha);
  const c2 = hexToRgba(color2, alpha);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default lerpColorWithAlpha;
