import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Request ID Middleware
 * - 모든 요청에 고유한 Request ID를 부여
 * - 요청 헤더에서 X-Request-ID를 읽거나 새로 생성
 * - Request 객체에 requestId 필드 추가
 * - 응답 헤더에 X-Request-ID 포함
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(
    req: Request & { requestId?: string },
    res: Response,
    next: NextFunction,
  ) {
    // 요청 헤더에서 X-Request-ID 읽기 (없으면 생성)
    const requestId =
      (req.headers['x-request-id'] as string) || this.generateRequestId();

    // Request 객체에 requestId 추가 (필터에서 사용)
    req.requestId = requestId;

    // 응답 헤더에 X-Request-ID 추가
    res.setHeader('X-Request-ID', requestId);

    next();
  }

  /**
   * 요청 추적을 위한 고유 ID 생성
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
