import Header from "@/components/header/header";
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
import { fetchSolvedProblems } from "./_lib/fetch/fetch-solved-problem";
import { fetchStreaks } from "./_lib/fetch/fetch-streaks";
import { fetchUserInfo } from "./_lib/fetch/fetch-user-info";

async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const parsedPage = parseInt(resolvedSearchParams.page || "1", 10);
  const currentPage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [userData, graphData, streakData, solvedData] = await Promise.all([
    fetchUserInfo(),
    fetchGraph(),
    fetchStreaks(),
    fetchSolvedProblems({ page: currentPage, size: 10 }),
  ]);

  const {
    submittedQuestionCount,
    yearlyAnswerSubmissions,
    consecutiveDayCount,
  } = streakData;
  const {
    problems,
    totalCount,
    currentPage: solvedCurrentPage,
    totalPages,
    pageSize,
  } = solvedData;

  // Refactor Todo: 365개 전부 채웠을 때 새로운 그림으로 전환하기
  const imageSrc = "/starry-night.jpg";
  return (
    <>
      <Header />
      <div className="w-full px-4 md:px-8 pt-8 md:pt-15 pb-16 md:pb-25 max-w-4xl flex flex-col gap-6 md:gap-10 min-h-main">
        <UserStatsCard
          nickname={userData.nickname}
          email={userData.email || "@test123"} // 추후 작업에서 해당 부분 email 리턴하도록 수정 필요.
          totalPoint={totalCount}
          profileImage={userData.profileImage}
          consecutiveDayCount={consecutiveDayCount}
        />
        <Tabs className="w-full" defaultValue="graph">
          <TabsList className="w-full justify-start">
            <TabsTrigger className="flex gap-1.5 md:gap-2.5" value="graph">
              <CircleCheckBig className="w-4 h-4 hidden sm:block" />
              지식 그래프
            </TabsTrigger>
            <TabsTrigger className="flex gap-1.5 md:gap-2.5" value="streak">
              <Brush className="w-4 h-4 hidden sm:block" />
              명화 스트릭
            </TabsTrigger>
            <TabsTrigger className="flex gap-1.5 md:gap-2.5" value="solvedList">
              <BookText className="w-4 h-4 hidden sm:block" />
              내가 푼 문제
            </TabsTrigger>
          </TabsList>
          <TabsContent
            className="w-full px-4 md:px-8 pb-4 md:pb-8"
            value="graph"
          >
            <GraphContent graphData={graphData} />
          </TabsContent>
          <TabsContent
            className="w-full px-4 md:px-8 pb-4 md:pb-8"
            value="streak"
          >
            <StreakContent
              streakCount={submittedQuestionCount}
              imageSrc={imageSrc}
              yearlyAnswerSubmissions={yearlyAnswerSubmissions}
            />
          </TabsContent>
          <TabsContent
            className="w-full px-4 md:px-8 pb-4 md:pb-8"
            value="solvedList"
          >
            <SolvedContent
              solvedProblems={problems}
              currentPage={solvedCurrentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
            />
          </TabsContent>
        </Tabs>
        <div data-boostad-zone className="overflow-x-hidden"></div>
      </div>
    </>
  );
}

export default MyPage;
