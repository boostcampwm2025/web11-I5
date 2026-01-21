import { Activity, ArrowRight, Mic, Share2 } from "lucide-react";
import Link from "next/link";
import GraphView from "./mypage/_components/graph-view/graph-view";
import { mockGraphData } from "./mypage/_constants/graph-mock";

async function Home() {
  const mockData = mockGraphData;
  return (
    <main className="w-full h-full flex flex-col bg-white">
      <section className="w-full relative py-16 px-48 flex justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center z-10 gap-10">
          <span className="bg-white border border-teal-100 rounded-[50px] px-4 py-2 text-teal-500 font-bold text-xs ">
            AI 지식 구조화 서비스
          </span>
          <span className="font-bold text-6xl text-center">
            말로 설명하며 완성하는
            <br />
            <span className="font-extrabold text-[64px] bg-linear-to-r from-[#039484] via-[#2CD1BF] to-[#039484] bg-clip-text text-transparent">
              나만의 지식 지도
            </span>
          </span>
          <p className="text-slate-500 text-center font-medium text-xl">
            단편적인 CS지식, 이제는 연결하세요.
            <br />
            말만해가 당신의 머릿속 지식을 체계적으로 구조화해 드립니다.
          </p>
          <div className="flex gap-4 ">
            <Link
              href="/questions"
              className="flex gap-1 text-white bg-teal-400 rounded-[50px] px-9 py-4 text-lg font-bold items-center"
            >
              지금 무료로 시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/guide"
              className="flex bg-white border border-slate-300 py-4 px-9 gap-1 rounded-[50px] items-center font-bold text-slate-600 text-lg"
            >
              <ArrowRight className="w-4 h-4" stroke="#475569" />
              사용 가이드
            </Link>
          </div>
        </div>
        <div className="opacity-40 w-4/5">
          <GraphView graphData={mockData} textRenderScale={1.2} />
        </div>
      </section>

      <section className="flex flex-col items-center px-48 py-16  border-slate-200 mb-34">
        <span className="text-slate-900 font-bold text-[32px]">
          학습의 새로운 패러다임
        </span>
        <div className="text-slate-500 font-medium text-lg pt-6 text-center">
          단순한 암기가 아닙니다.{" "}
          <span className="text-teal-600 font-bold">말만해</span>는 당신이 아는
          것을 구조적으로 연결하고, <br />
          실제로 설명할 수 있는 살아있는 지식으로 만듭니다.
        </div>
        <div className="w-full flex gap-7 pt-16 justify-center items-center">
          <article className="max-w-83 flex-1 bg-teal-50 flex flex-col py-9 px-10 justify-center items-center gap-4 rounded-xl">
            <Mic stroke="#475569" className="w-6 h-6" />
            <span className="text-teal-700 font-bold text-xl">
              음성 인출 연습
            </span>
            <span className="text-slate-600 font-medium text-base text-pretty text-center">
              눈으로 읽는 공부는 그만. 실제 면접처럼 말로 설명하며 내가 무엇을
              모르는지 메타인지를 높입니다.
            </span>
          </article>
          <article className=" max-w-83 flex-1 bg-teal-50 flex flex-col py-9 px-10 justify-center items-center gap-4 rounded-xl">
            <Activity stroke="#475569" className="w-6 h-6" />
            <span className="text-teal-700 font-bold text-xl">
              5가지 지표 분석
            </span>
            <span className="text-slate-600 font-medium text-base text-pretty text-center">
              정확성, 논리성, 심층성, 완성도, 실무 활용도. AI가 다각도로 분석한
              리포트를 매일 받아보세요.
            </span>
          </article>
          <article className="max-w-83 flex-1 bg-teal-50 flex flex-col py-9 px-10 justify-center items-center gap-4 rounded-xl">
            <Share2 stroke="#475569" className="w-6 h-6" />
            <span className="text-teal-700 font-bold text-xl">
              지식 그래프 연결
            </span>
            <span className="text-slate-600 font-medium text-base text-pretty text-center">
              파편화된 개념들을 연결하여 나만의 지식 지도를 만듭니다. 꼬리에
              꼬리를 무는 질문에 대비하세요.
            </span>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Home;
