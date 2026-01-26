import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../types/error-response.type';

/**
 * All Exceptions Filter
 * - HttpException이 아닌 모든 에러를 처리
 * - TypeORM 에러, JavaScript 런타임 에러, 외부 서비스 에러 등
 * - 프로덕션에서 민감한 정보 숨김
 * - 클라이언트에는 안전한 메시지만 반환
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    // Request ID 가져오기
    const requestId = request.requestId || 'unknown';

    // 에러 타입에 따른 상태 코드와 메시지 결정
    const { statusCode, message, details } = this.mapException(exception);

    // 에러 응답 구성
    const errorResponse: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
      message,
    };

    // 개발 환경에서만 추가 정보 포함
    if (this.isDevelopment) {
      errorResponse.error = this.getErrorName(exception);
      errorResponse.details = details || this.getErrorDetails(exception);
      errorResponse.stack = this.getErrorStack(exception);
    }

    // 로깅 (전체 에러 정보 포함)
    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - ${statusCode} ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(statusCode).json(errorResponse);
  }

  /**
   * 예외를 HTTP 상태 코드와 메시지로 매핑
   */
  private mapException(exception: unknown): {
    statusCode: number;
    message: string;
    details?: string;
  } {
    // JavaScript 기본 에러
    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '서버 내부 오류가 발생했습니다.',
        details: this.isDevelopment ? exception.message : undefined,
      };
    }

    // 알 수 없는 에러
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '서버 내부 오류가 발생했습니다.',
    };
  }

  /**
   * 에러 이름 추출
   */
  private getErrorName(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.constructor.name;
    }
    return typeof exception;
  }

  /**
   * 에러 상세 정보 추출
   */
  private getErrorDetails(
    exception: unknown,
  ): string | Record<string, unknown> {
    if (exception instanceof Error) {
      return exception.message;
    }

    if (typeof exception === 'object' && exception !== null) {
      return exception as Record<string, unknown>;
    }

    return String(exception);
  }

  /**
   * 스택 트레이스 추출
   */
  private getErrorStack(exception: unknown): string | undefined {
    if (exception instanceof Error && exception.stack) {
      return exception.stack;
    }
    return undefined;
  }
}
