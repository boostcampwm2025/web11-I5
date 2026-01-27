import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorResponse } from '../types/error-response.type';

/**
 * HTTP Exception Filter
 * - 모든 예외를 통일된 형식으로 변환
 * - ValidationPipe 에러를 details 필드로 포맷팅
 * - Request ID, userId, IP 로깅
 * - 에러 레벨별 로깅 (4xx: warn, 5xx: error)
 * - 개발 환경에서만 추가 정보 제공
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<
      Request & { requestId?: string; userId?: number }
    >();

    // 상태 코드 및 에러 응답 추출
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Request ID 가져오기
    const requestId = request.requestId || 'unknown';
    const userId = request.userId;
    const { method, url, ip } = request;

    // 에러 응답 구성
    const errorResponse: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: url,
      method,
      requestId,
      message: this.extractMessage(exceptionResponse),
    };

    // ValidationPipe 에러인 경우 details 추가
    if (this.isValidationError(exceptionResponse)) {
      errorResponse.details = this.formatValidationErrors(exceptionResponse);
    }

    // 개발 환경에서만 추가 정보 포함
    if (this.isDevelopment) {
      if (exception instanceof HttpException) {
        errorResponse.error = exception.name;
      }

      // exceptionResponse가 객체인 경우 error 필드 추가
      if (
        typeof exceptionResponse === 'object' &&
        'error' in exceptionResponse &&
        !this.isValidationError(exceptionResponse)
      ) {
        errorResponse.details = exceptionResponse;
      }

      // 스택 트레이스 추가
      if (exception instanceof Error && exception.stack) {
        errorResponse.stack = exception.stack;
      }
    }

    // 로그 메시지 구성
    const logMessage = `[${requestId}] ${method} ${url} ${statusCode} - ${this.extractMessage(exceptionResponse)}${userId ? ` - UserId: ${userId}` : ''} - IP: ${ip}`;

    // 에러 레벨에 따른 로깅
    if (statusCode >= 500) {
      // 서버 에러 (5xx)
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (statusCode >= 400) {
      // 클라이언트 에러 (4xx)
      this.logger.warn(logMessage);
    }

    // 응답 전송
    response.status(statusCode).json(errorResponse);
  }

  /**
   * 에러 메시지 추출
   */
  private extractMessage(exceptionResponse: string | object): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object') {
      // ValidationPipe 에러: message가 배열
      if (
        'message' in exceptionResponse &&
        Array.isArray(exceptionResponse.message)
      ) {
        return '입력값이 올바르지 않습니다.';
      }

      // 일반 HttpException: message가 문자열
      if ('message' in exceptionResponse) {
        return String(exceptionResponse.message);
      }
    }

    return '오류가 발생했습니다.';
  }

  /**
   * ValidationPipe 에러인지 확인
   */
  private isValidationError(
    exceptionResponse: string | object,
  ): exceptionResponse is { message: string[] } {
    return (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse &&
      Array.isArray(exceptionResponse.message) &&
      exceptionResponse.message.length > 0 &&
      typeof exceptionResponse.message[0] === 'string'
    );
  }

  /**
   * ValidationPipe 에러를 details 형식으로 변환
   */
  private formatValidationErrors(
    exceptionResponse: string | object,
  ): { validation: string[] } | undefined {
    if (!this.isValidationError(exceptionResponse)) {
      return undefined;
    }

    // 배열 형태의 메시지를 객체로 변환
    const messages = exceptionResponse.message;

    // 배열을 그대로 반환 (또는 필요시 파싱)
    return { validation: messages };
  }
}
