import Header from "@/components/header/header";
import GraphView from "./mypage/_components/graph-view/graph-view";
import { mockGraphData } from "./mypage/_constants/graph-mock";
import localFont from "next/font/local";
import { cn } from "@/lib/cn";
import { SplitBounceMalManHae } from "./_components/split-bounce-malmanhae";
import { HeroFeatureMotion } from "./_components/hero-feature-motion";

const oneMobile = localFont({
  src: "../assets/fonts/ONE-Mobile-Title.woff",
});

const paperlogy = localFont({
  src: "../assets/fonts/Paperlogy-5Medium.woff2",
});

async function Home() {
  const mockData = mockGraphData;
  return (
    <>
      <Header />
      <main className="w-full h-full flex flex-col bg-white overflow-x-hidden">
        <section className="w-full min-h-screen relative py-8 md:py-16 px-4 md:px-8 flex justify-center overflow-hidden">
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center z-10 w-full px-4 lg:px-0",
            )}
          >
            <div className={oneMobile.className}>
              <SplitBounceMalManHae />
            </div>
            <div className={cn(paperlogy.className, "w-full max-w-2xl")}>
              <HeroFeatureMotion />
            </div>
          </div>
          <div className="opacity-20 md:opacity-30 w-full lg:w-4/5 pointer-events-none">
            <GraphView
              graphData={mockData}
              textRenderScale={1.2}
              clickEventDisabled={true}
            />
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
