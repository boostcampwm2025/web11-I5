/**
 * 통일된 에러 응답 인터페이스
 */
export interface ErrorResponse {
  /** HTTP 상태 코드 */
  statusCode: number;

  /** ISO 8601 타임스탬프 */
  timestamp: string;

  /** HTTP 메서드 */
  method: string;

  /** 요청 경로 */
  path: string;

  /** 요청 추적 ID */
  requestId: string;

  /** 한국어 사용자 메시지 */
  message: string;

  /** 에러 이름 (개발 환경에서만) */
  error?: string;

  /** 추가 컨텍스트 (개발 환경에서만) */
  details?: Record<string, unknown> | string;

  /** 스택 트레이스 (개발 환경에서만) */
  stack?: string;
}
