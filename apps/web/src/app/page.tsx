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
      <main className="w-full flex flex-col bg-white overflow-x-hidden">
        <section className="w-full min-h-[calc(100svh-64px)] relative flex justify-center items-center overflow-hidden">
          <div
            className={cn(
              "flex flex-col justify-center items-center z-10 w-full px-4 lg:px-0 pb-8 md:pb-16 pt-20 md:pt-36",
              "pointer-events-none",
            )}
          >
            <div className={oneMobile.className}>
              <SplitBounceMalManHae />
            </div>
            <div className={cn(paperlogy.className, "w-full max-w-2xl")}>
              <HeroFeatureMotion />
            </div>
          </div>
          <div className="absolute inset-0 opacity-20 md:opacity-20 flex justify-center">
            <div className="w-full h-full">
              <GraphView
                graphData={mockData}
                textRenderScale={1.2}
                clickEventDisabled={true}
                zoomEnabled={false}
                initialScale={1}
                showLabels={false}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
