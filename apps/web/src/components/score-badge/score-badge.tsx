type ScoreBadgeSize = "sm" | "md" | "lg";

type ScoreBadgeProps = {
  score: number;
  size?: ScoreBadgeSize;
  className?: string;
};

function getScoreTone(score: number) {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 75) return "bg-teal-50 text-teal-700 border-teal-200";
  if (score >= 60) return "bg-sky-50 text-sky-700 border-sky-200";
  if (score >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

const sizeStyle: Record<ScoreBadgeSize, string> = {
  sm: "h-6 w-12 text-xs",
  md: "h-7 w-14 text-sm",
  lg: "h-10 w-20 text-2xl", // 요구사항
};

export function ScoreBadge({ score, size = "md", className }: ScoreBadgeProps) {
  const safeScore = Number.isFinite(score) ? score : 0;
  const clamped = Math.max(0, Math.min(100, safeScore));
  const tone = getScoreTone(clamped);

  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "rounded-md border font-medium tabular-nums",
        tone,
        sizeStyle[size],
        className ?? "",
      ].join(" ")}
      aria-label={`점수 ${clamped}점`}
    >
      {clamped}점
    </span>
  );
}
