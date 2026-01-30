import VoronoiStreak from "../_components/voronoi-streak/voronoi-streak";
import { YearlyAnswerSubmissions } from "../_types/streak";

async function StreakContent({
  streakCount,
  imageSrc,
  yearlyAnswerSubmissions,
}: {
  streakCount: number;
  imageSrc: string;
  yearlyAnswerSubmissions: YearlyAnswerSubmissions[];
}) {
  return (
    <>
      <div className="py-6 md:py-8 flex flex-col justify-start gap-1 md:gap-2">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <span className="text-base md:text-lg font-bold text-slate-900">
            명화 스트릭
          </span>
          <span className="text-teal-500">{streakCount}개</span>
        </div>
        <span className="text-xs md:text-sm font-medium text-slate-500">
          꾸준히 문제를 풀면서 그림을 완성해보세요.
        </span>
      </div>
      <VoronoiStreak
        streakCount={streakCount}
        imageSrc={imageSrc}
        yearlyAnswerSubmissions={yearlyAnswerSubmissions}
      />
    </>
  );
}

export default StreakContent;
