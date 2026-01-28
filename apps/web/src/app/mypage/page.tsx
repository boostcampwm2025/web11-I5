import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/tabs/tabs";
import { BookText, Brush, CircleCheckBig } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../(auth)/_utils/auth";
import UserStatsCard from "./_components/user-stats-card/user-stats-card";
import GraphContent from "./_contents/graph-content";
import SolvedContent from "./_contents/solved-content";
import StreakContent from "./_contents/streak-content";
import { fetchGraph } from "./_lib/fetch/fetch-graph";
import { fetchSolvedProblem } from "./_lib/fetch/fetch-solved-problem";
import { fetchStreaks } from "./_lib/fetch/fetch-streaks";
import { fetchUserInfo } from "./_lib/fetch/fetch-user-info";

async function MyPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const [userData, graphData, streakData, solvedData] = await Promise.all([
    fetchUserInfo(),
    fetchGraph(),
    fetchStreaks(),
    fetchSolvedProblem(),
  ]);
  const {
    submittedQuestionCount,
    yearlyAnswerSubmissions,
    consecutiveDayCount,
  } = streakData;
  const { problems, totalCount } = solvedData;

  // Refactor Todo: 365개 전부 채웠을 때 새로운 그림으로 전환하기
  const imageSrc = "/starry-night.jpg";
  return (
    <div className="w-full px-8 pt-15 pb-25 max-w-4xl flex flex-col gap-10">
      <UserStatsCard
        nickname={userData.nickname}
        email={userData.email || "@test123"} // 추후 작업에서 해당 부분 email 리턴하도록 수정 필요.
        totalPoint={totalCount}
        role={userData.role}
        consecutiveDayCount={consecutiveDayCount}
      />
      <Tabs className="w-full" defaultValue="graph">
        <TabsList>
          <TabsTrigger className="flex gap-2.5" value="graph">
            <CircleCheckBig className="w-4 h-4" />
            지식 그래프
          </TabsTrigger>
          <TabsTrigger className="flex gap-2.5" value="streak">
            <Brush className="w-4 h-4" />
            명화 스트릭
          </TabsTrigger>
          <TabsTrigger className="flex gap-2.5" value="solvedList">
            <BookText className="w-4 h-4" />
            내가 푼 문제
          </TabsTrigger>
        </TabsList>
        <TabsContent
          className="bg-white w-full px-8 pb-8 rounded-xl border border-slate-200"
          value="graph"
        >
          <GraphContent graphData={graphData} />
        </TabsContent>
        <TabsContent
          className="bg-white w-full px-8 pb-8 rounded-xl border border-slate-200"
          value="streak"
        >
          <StreakContent
            streakCount={submittedQuestionCount}
            imageSrc={imageSrc}
            yearlyAnswerSubmissions={yearlyAnswerSubmissions}
          />
        </TabsContent>
        <TabsContent
          className="bg-white w-full px-8 pb-8 rounded-xl border border-slate-200"
          value="solvedList"
        >
          <SolvedContent solvedProblems={problems} />
        </TabsContent>
      </Tabs>
      <div data-boostad-zone></div>
    </div>
  );
}

export default MyPage;
