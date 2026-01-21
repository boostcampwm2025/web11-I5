import VoronoiStreak from "../_components/voronoi-streak/voronoi-streak";

async function StreakContent({
  streakCount,
  imageSrc,
}: {
  streakCount: number;
  imageSrc: string;
}) {
  return (
    <>
      <div className="py-8 flex flex-col justify-start gap-2">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-slate-900">명화 스트릭</span>
          <span className="text-sm font-medium text-slate-500">
            <span className="text-teal-500">{streakCount}일</span>/365일
          </span>
        </div>
        <span className="text-sm font-medium text-slate-500">
          1년간의 노력으로 그림을 완성해보세요.
        </span>
      </div>
      <VoronoiStreak streakCount={streakCount} imageSrc={imageSrc} />
    </>
  );
}

export default StreakContent;
