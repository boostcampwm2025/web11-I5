interface ScoreGaugeProps {
  score: number;
}

function getScoreColor(score: number) {
  if (score >= 90) {
    return {
      stroke: "stroke-emerald-400",
      text: "text-emerald-700",
    };
  }
  if (score >= 75) {
    return {
      stroke: "stroke-teal-400",
      text: "text-teal-700",
    };
  }
  if (score >= 60) {
    return {
      stroke: "stroke-sky-400",
      text: "text-sky-700",
    };
  }
  if (score >= 40) {
    return {
      stroke: "stroke-amber-400",
      text: "text-amber-700",
    };
  }
  return {
    stroke: "stroke-rose-400",
    text: "text-rose-700",
  };
}

function ScoreGauge({ score }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clamped);

  return (
    <div
      className="relative w-20 h-20 md:w-25 md:h-25 shrink-0"
      role="img"
      aria-label={`총점 ${clamped}점`}
    >
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 36 36"
        aria-hidden="true"
      >
        <circle
          className="fill-none stroke-slate-100 stroke-3"
          cx="18"
          cy="18"
          r="15.9155"
        />
        <circle
          className={[
            "fill-none stroke-3 transition-all duration-1000 ease-out",
            color.stroke,
          ].join(" ")}
          cx="18"
          cy="18"
          r="15.9155"
          strokeDasharray={`${clamped}, 100`}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={[
            "text-xl md:text-2xl font-extrabold leading-none",
            color.text,
          ].join(" ")}
        >
          {clamped}점
        </span>
      </div>
    </div>
  );
}

export default ScoreGauge;
