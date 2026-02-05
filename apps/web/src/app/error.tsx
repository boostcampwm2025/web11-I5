"use client";

import { AlertCircle, RefreshCcw, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import StaticHeader from "@/components/header/static-header";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ApiError property 기반 타입 가드
interface SerializedApiError {
  name: string;
  status: number;
  statusText: string;
  body?: {
    message?: string;
    requestId?: string;
    details?: {
      validation?: string[];
    };
  };
}

function isApiError(error: unknown): error is SerializedApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ApiError" &&
    "status" in error &&
    typeof (error as SerializedApiError).status === "number"
  );
}

function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const router = useRouter();

  // ApiError 타입 체크 및 처리
  if (isApiError(error)) {
    const isAuthError = error.status === 401 || error.status === 403;

    // 401/403 인증 에러
    if (isAuthError) {
      return (
        <>
          <StaticHeader />
          <div className="flex flex-col items-center justify-center flex-1 w-full gap-6 px-4">
            <div className="p-8 w-full text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-25 h-25 bg-orange-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-15 h-15 text-orange-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  로그인이 필요합니다
                </h2>
                <p className="text-slate-600 text-lg">
                  인증이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-bold cursor-pointer"
                  onClick={() => router.push("/login")}
                >
                  로그인 페이지로 이동
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    // 사용자 메시지 추출
    const getUserMessage = (): string => {
      if (error.body?.message) {
        return error.body.message;
      }

      // 기본 메시지
      const isNetworkError = error.status === 0;
      const isServerError = error.status >= 500;
      const isClientError = error.status >= 400 && error.status < 500;
      const isNotFound = error.status === 404;

      if (isNetworkError) {
        return "서버와 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
      }
      if (isServerError) {
        return "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      }
      if (isAuthError) {
        return "인증이 필요합니다. 다시 로그인해주세요.";
      }
      if (isNotFound) {
        return "요청하신 리소스를 찾을 수 없습니다.";
      }
      if (isClientError) {
        return "잘못된 요청입니다. 다시 시도해주세요.";
      }

      return "요청을 처리하는 중 오류가 발생했습니다.";
    };

    const userMessage = getUserMessage();
    const validationErrors = error.body?.details?.validation || null;
    const requestId = error.body?.requestId || null;

    const isNetworkError = error.status === 0;
    const isServerError = error.status >= 500;
    const isClientError = error.status >= 400 && error.status < 500;

    // 네트워크 에러 (연결 실패)
    if (isNetworkError) {
      return (
        <>
          <StaticHeader />
          <div className="flex flex-col items-center justify-center flex-1 w-full gap-6 px-4">
            <div className="p-8 w-full text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-25 h-25 bg-red-50 rounded-full flex items-center justify-center">
                  <WifiOff className="w-15 h-15 text-red-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  서버와 연결할 수 없습니다
                </h2>
                <p className="text-slate-600 text-lg">{userMessage}</p>
                {process.env.NODE_ENV === "development" && requestId && (
                  <p className="text-slate-400 text-xs mt-2">
                    Request ID: {requestId}
                  </p>
                )}
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-bold flex items-center gap-2 cursor-pointer"
                  onClick={reset}
                >
                  <RefreshCcw className="w-4 h-4" />
                  다시 시도
                </button>
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.back()}
                >
                  이전으로
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    // 5xx 서버 에러
    if (isServerError) {
      return (
        <>
          <StaticHeader />
          <div className="flex flex-col items-center justify-center flex-1 w-full gap-6 px-4">
            <div className="p-8 w-full text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-25 h-25 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-15 h-15 text-red-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  서버 오류가 발생했습니다
                </h2>
                <p className="text-slate-600 text-lg">{userMessage}</p>
                {process.env.NODE_ENV === "development" && requestId && (
                  <p className="text-slate-400 text-xs mt-2">
                    Request ID: {requestId}
                  </p>
                )}
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-bold flex items-center gap-2 cursor-pointer"
                  onClick={reset}
                >
                  <RefreshCcw className="w-4 h-4" />
                  다시 시도
                </button>
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.back()}
                >
                  이전으로
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    // 4xx 클라이언트 에러
    if (isClientError && !isAuthError) {
      return (
        <>
          <StaticHeader />
          <div className="flex flex-col items-center justify-center flex-1 w-full gap-6 px-4">
            <div className="p-8 w-full text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-25 h-25 bg-orange-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-15 h-15 text-orange-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  요청을 처리할 수 없습니다
                </h2>
                <p className="text-slate-600 text-lg">{userMessage}</p>
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
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-bold cursor-pointer"
                  onClick={() => router.back()}
                >
                  이전으로
                </button>
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push("/")}
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }
  }

  // 예상치 못한 에러
  return (
    <>
      <StaticHeader />
      <div className="flex flex-col items-center justify-center flex-1 w-full gap-6 px-4">
        <div className="p-8 w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-25 h-25 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-15 h-15 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">
              문제가 발생했습니다
            </h2>
            <p className="text-slate-600 text-lg">
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
          <div className="flex gap-4 justify-center">
            <button
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-bold flex items-center gap-2 cursor-pointer"
              onClick={reset}
            >
              <RefreshCcw className="w-4 h-4" />
              다시 시도
            </button>
            <button
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              onClick={() => router.push("/")}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ErrorBoundary;
