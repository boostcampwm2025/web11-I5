"use client";

import { logger } from "@/lib/sentry-logger";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function Error({ error }: { error: Error & { digest?: string } }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  useEffect(() => {
    const context = {
      pathname,
      questionId: params?.questionId,
      attempt: searchParams?.get("attempt"),
      fullUrl: `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`,
      errorMessage: error.message,
      errorStack: error.stack,
      errorDigest: error.digest,
    };

    if (process.env.NODE_ENV === "production") {
      logger.error("Error in daily questions page", context);
    }
  }, [error, pathname, searchParams, params]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-gray-300">ERROR!</h1>
        <h2 className="text-2xl font-semibold">
          문제를 불러오는 중 오류가 발생했습니다
        </h2>
        <p className="text-gray-600 max-w-md">
          일시적인 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/daily/questions"
          className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-bold"
        >
          문제 목록으로 가기
        </Link>
        <Link
          href="/"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default Error;
