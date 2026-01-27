import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

/**
 * HTTP 요청/응답 로깅 인터셉터
 * 모든 HTTP 요청과 응답을 로깅합니다.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  // 로그에서 제외할 경로 목록
  private readonly excludedPaths = ['/health', '/api-docs', '/api-docs-json'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // 제외된 경로는 로깅하지 않음
    if (this.excludedPaths.some((path) => request.url.startsWith(path))) {
      return next.handle();
    }

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // 요청 정보 추출
    const userId = (request as Request & { userId?: number }).userId;
    const requestId = this.generateRequestId();

    // 요청 로그
    this.logger.log(
      `[${requestId}] ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}${userId ? ` - UserId: ${userId}` : ''}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // 응답 로그
          const logMessage = `[${requestId}] ${method} ${url} ${statusCode} - ${duration}ms`;

          if (statusCode >= 500) {
            this.logger.error(logMessage);
          } else if (statusCode >= 400) {
            this.logger.warn(logMessage);
          } else {
            this.logger.log(logMessage);
          }
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const statusCode = this.extractStatusCode(error, response.statusCode);
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;

          this.logger.error(
            `[${requestId}] ${method} ${url} ${statusCode} - ${duration}ms - Error: ${errorMessage}`,
            errorStack,
          );
        },
      }),
    );
  }

  /**
   * 요청 추적을 위한 고유 ID 생성
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private extractStatusCode(
    error: unknown,
    responseStatusCode: number,
  ): number {
    if (error instanceof HttpException) {
      return error.getStatus();
    }

    if (error instanceof Error) {
      return responseStatusCode >= 400 ? responseStatusCode : 500;
    }

    return 500;
  }
}
