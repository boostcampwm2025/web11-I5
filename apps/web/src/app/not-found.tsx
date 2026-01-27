"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] gap-6 px-4">
      <div className="p-8 w-full text-center space-y-6">
        <h1 className="flex items-center justify-center gap-3 text-6xl font-bold text-gray-300">
          <TriangleAlert size={64} />
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-slate-600 text-lg">
            요청하신 페이지가 존재하지 않습니다. URL을 다시 확인해주세요.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-bold cursor-pointer"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
