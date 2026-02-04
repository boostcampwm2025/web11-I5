import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header/header";
import { NotFoundLogger } from "@/app/_components/not-found-logger";

async function NotFound() {
  return (
    <>
      <NotFoundLogger pageName="Report Page" />
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 w-full gap-6 px-4">
        <div className="p-8 w-full text-center space-y-6">
          <h1 className="flex items-center justify-center gap-3 text-6xl font-bold text-gray-300">
            <TriangleAlert size={64} />
            404
          </h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">
              요청하신 리포트를 찾을 수 없습니다
            </h2>
            <p className="text-slate-600 text-lg">
              존재하지 않는 문제이거나, 유효하지 않은 제출 기록입니다. URL을
              다시 확인해 주세요.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link
              href="/daily/questions"
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-bold cursor-pointer"
            >
              문제 목록으로 가기
            </Link>
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default NotFound;
