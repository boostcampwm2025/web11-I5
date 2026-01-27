import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * HTTP 예외 필터
 * 모든 HTTP 예외를 일관된 형식으로 로깅하고 응답합니다.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const userId = (request as Request & { userId?: number }).userId;
    const { method, url, ip } = request;

    // 에러 정보 구성
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: url,
      method,
      message:
        typeof message === 'string'
          ? message
          : (message as { message?: string }).message || 'An error occurred',
    };

    // 로그 메시지 구성
    const logMessage = `${method} ${url} ${status} - ${typeof message === 'string' ? message : JSON.stringify(message)}${userId ? ` - UserId: ${userId}` : ''} - IP: ${ip}`;

    // 에러 레벨에 따른 로깅
    if (status >= 500) {
      // 서버 에러 (5xx)
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      // 클라이언트 에러 (4xx)
      this.logger.warn(logMessage);
    }

    // 응답 전송
    response.status(status).json(errorResponse);
  }
}
