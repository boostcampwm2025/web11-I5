interface ScoreGaugeProps {
  score: number;
}

function ScoreGauge({ score }: ScoreGaugeProps) {
  return (
    <div className="relative w-20 h-20 md:w-25 md:h-25 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          className="fill-none stroke-slate-100 stroke-3"
          cx="18"
          cy="18"
          r="15.9155"
        />
        <circle
          className="fill-none stroke-teal-400 stroke-3 transition-all duration-1000 ease-out"
          cx="18"
          cy="18"
          r="15.9155"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl md:text-2xl font-extrabold leading-none text-slate-800">
          {score}
        </span>
        <span className="text-[0.5rem] font-extrabold text-slate-400 mt-0.5">
          TOTAL
        </span>
      </div>
    </div>
  );
}

export default ScoreGauge;
