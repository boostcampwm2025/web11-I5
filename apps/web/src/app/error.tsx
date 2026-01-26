"use client";

import { Button } from "@/components/button/button";
import { ApiError } from "@/lib/api-error";
import { AlertCircle, RefreshCcw, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const router = useRouter();

  // ApiError 타입 체크 및 처리
  if (error instanceof ApiError) {
    // 401/403 인증 에러
    if (error.isAuthError()) {
      router.push("/login");
      return null;
    }

    const userMessage = error.getUserMessage();
    const validationErrors = error.getValidationErrors();
    const requestId = error.getRequestId();

    // 네트워크 에러 또는 5xx 서버 에러
    if (error.isNetworkError()) {
      return (
        <div className="w-full max-w-4xl mx-auto px-8 py-15 min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <WifiOff className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">
                서버와 연결할 수 없습니다
              </h2>
              <p className="text-slate-600 text-sm">{userMessage}</p>
              {process.env.NODE_ENV === "development" && requestId && (
                <p className="text-slate-400 text-xs mt-2">
                  Request ID: {requestId}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                이전으로
              </Button>
              <Button
                className="flex-1 flex items-center gap-2"
                onClick={reset}
              >
                <RefreshCcw className="w-4 h-4" />
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // 4xx 클라이언트 에러
    if (error.isClientError()) {
      return (
        <div className="w-full max-w-4xl mx-auto px-8 py-15 min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">
                요청을 처리할 수 없습니다
              </h2>
              <p className="text-slate-600 text-sm">{userMessage}</p>
              {validationErrors && validationErrors.length > 0 && (
                <div className="mt-3 text-left">
                  <p className="text-xs text-slate-500 mb-1">상세 정보:</p>
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {process.env.NODE_ENV === "development" && requestId && (
                <p className="text-slate-400 text-xs mt-2">
                  Request ID: {requestId}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/")}
              >
                홈으로
              </Button>
              <Button className="flex-1" onClick={() => router.back()}>
                이전으로
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 예상치 못한 에러
  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-15 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            문제가 발생했습니다
          </h2>
          <p className="text-slate-600 text-sm">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                개발자 정보
              </summary>
              <pre className="mt-2 text-xs text-slate-700 bg-slate-50 p-2 rounded overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/")}
          >
            홈으로
          </Button>
          <Button className="flex-1 flex items-center gap-2" onClick={reset}>
            <RefreshCcw className="w-4 h-4" />
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
