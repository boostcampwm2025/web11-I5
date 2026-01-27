"use client";

import { logger } from "@/lib/sentry-logger";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function NotFound() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  useEffect(() => {
    const context = {
      pathname,
      questionId: params?.questionId,
      attempt: searchParams?.get("attempt"),
      fullUrl: `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`,
    };

    if (process.env.NODE_ENV === "production") {
      logger.warn("404 Not Found - Question Detail Page", context);
    }
  }, [pathname, searchParams, params]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] gap-6 px-4">
      <div className="p-8 w-full text-center space-y-6">
        <h1 className="flex items-center justify-center gap-3 text-6xl font-bold text-gray-300">
          <TriangleAlert size={64} />
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">
            요청하신 문제를 찾을 수 없습니다
          </h2>
          <p className="text-slate-600 text-lg">
            존재하지 않는 문제입니다. 문제 리스트에서 문제를 뽑아주세요.
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
    </div>
  );
}

export default NotFound;
