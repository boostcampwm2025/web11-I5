import Header from "@/components/header";
import GraphView from "./mypage/_components/graph-view/graph-view";
import { mockGraphData } from "./mypage/_constants/graph-mock";

function Home() {
  const mockData = mockGraphData;
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Header />
      <div className="w-full h-full relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center z-10">
          <div className="text-5xl w-full font-bold">
            말로 설명하며 완성하는 나만의 지식 지도
          </div>
        </div>
        <div className="opacity-20">
          <GraphView graphData={mockData} textRenderScale={1.2} />
        </div>
      </div>
    </div>
  );
}

export default Home;
