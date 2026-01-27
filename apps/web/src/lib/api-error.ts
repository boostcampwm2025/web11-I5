interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  requestId: string;
  message: string;
  error?: string; // 개발 환경에서만 (에러 타입 이름)
  details?: unknown; // 추가 정보 (validation 에러 등)
  stack?: string; // 개발 환경에서만
}

/**
 * API 에러 클래스
 * status: HTTP 상태 코드
 * statusText: HTTP 상태 텍스트
 * body: 응답 본문 (JSON 파싱 가능한 경우)
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body?: unknown,
  ) {
    super(`API 요청 실패: ${status} ${statusText}`);
    this.name = "ApiError";
  }

  // 네트워크 에러 여부 (연결 실패)
  isNetworkError(): boolean {
    return this.status === 0;
  }

  // 5xx 서버 에러 여부
  isServerError(): boolean {
    return this.status >= 500;
  }

  // 인증 에러 여부 (401, 403)
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  // Not Found 에러 여부
  isNotFound(): boolean {
    return this.status === 404;
  }

  // 4xx 클라이언트 에러 여부
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  // 백엔드 ErrorResponse 타입 가드
  private isErrorResponse(body: unknown): body is ErrorResponse {
    return (
      typeof body === "object" &&
      body !== null &&
      "statusCode" in body &&
      "message" in body
    );
  }

  // 서버에서 보낸 메시지 추출
  getServerMessage(): string | null {
    if (!this.body || typeof this.body !== "object") {
      return null;
    }

    if (this.isErrorResponse(this.body)) {
      return this.body.message;
    }

    // 외부 API 등
    const bodyObj = this.body as Record<string, unknown>;
    if (typeof bodyObj.message === "string") {
      return bodyObj.message;
    }

    return null;
  }

  // 백엔드 ErrorResponse의 details 필드
  getDetails(): unknown {
    if (!this.body || typeof this.body !== "object") {
      return null;
    }

    if (this.isErrorResponse(this.body)) {
      return this.body.details;
    }

    const bodyObj = this.body as Record<string, unknown>;
    return bodyObj.details ?? null;
  }

  // Validation 에러 메시지 배열 추출
  getValidationErrors(): string[] | null {
    const details = this.getDetails();

    if (
      details &&
      typeof details === "object" &&
      "validation" in details &&
      Array.isArray(details.validation)
    ) {
      return details.validation;
    }

    return null;
  }

  // Request ID 추출
  getRequestId(): string | null {
    if (!this.body || typeof this.body !== "object") {
      return null;
    }

    if (this.isErrorResponse(this.body)) {
      return this.body.requestId;
    }

    return null;
  }

  // 에러 타입 분류 (Sentry 태그용)
  getErrorType(): string {
    if (this.isNetworkError()) {
      return "network";
    }
    if (this.isServerError()) {
      return "server";
    }
    if (this.isAuthError()) {
      return "auth";
    }
    if (this.isNotFound()) {
      return "not_found";
    }
    if (this.isClientError()) {
      return "client";
    }
    return "unknown";
  }

  // 사용자에게 표시할 에러 메시지
  getUserMessage(): string {
    const serverMessage = this.getServerMessage();
    if (serverMessage) {
      return serverMessage;
    }

    // 기본 메시지
    if (this.isNetworkError()) {
      return "서버와 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
    }

    if (this.isServerError()) {
      return "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

    if (this.isAuthError()) {
      return "인증이 필요합니다. 다시 로그인해주세요.";
    }

    if (this.isNotFound()) {
      return "요청하신 리소스를 찾을 수 없습니다.";
    }

    if (this.isClientError()) {
      return "잘못된 요청입니다. 다시 시도해주세요.";
    }

    return "요청을 처리하는 중 오류가 발생했습니다.";
  }
}
