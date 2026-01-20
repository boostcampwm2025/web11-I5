import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/tabs/tabs";
import { BookText, Brush, CircleCheckBig } from "lucide-react";
import UserStatsCard from "./_components/user-stats-card/user-stats-card";
import { mockGraphData } from "./_constants/graph-mock";
import GraphContent from "./_contents/graph-content";
import SolvedContent from "./_contents/solved-content";
import StreakContent from "./_contents/streak-content";

async function MyPage() {
  //실제 api 연동시 여기에 데이터 패칭 로직
  const userData = {
    id: 1,
    nickname: "김개발",
    email: "@malman_dev",
    totalPoint: 200,
    role: "FRONTEND DEV",
  };
  const consecutiveDayCount = 0;
  const mockData = mockGraphData;
  const streakCount = 40;
  const imageSrc = "/starry-night.jpg";
  return (
    <div className="w-4xl px-8 py-15 max-w-4xl flex flex-col gap-10">
      <UserStatsCard
        nickname={userData.nickname}
        email={userData.email}
        totalPoint={userData.totalPoint}
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
          <GraphContent graphData={mockData} />
        </TabsContent>
        <TabsContent
          className="bg-white w-full px-8 pb-8 rounded-xl border border-slate-200"
          value="streak"
        >
          <StreakContent streakCount={streakCount} imageSrc={imageSrc} />
        </TabsContent>
        <TabsContent
          className="bg-white w-full px-8 pb-8 rounded-xl border border-slate-200"
          value="solvedList"
        >
          <SolvedContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MyPage;
