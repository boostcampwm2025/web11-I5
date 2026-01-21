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
}
