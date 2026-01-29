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
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter, Histogram } from 'prom-client';

/**
 * HTTP 요청/응답 로깅 인터셉터
 * 모든 HTTP 요청과 응답을 로깅합니다.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  // 로그에서 제외할 경로 목록
  private readonly excludedPaths = [
    '/health',
    '/api-docs',
    '/api-docs-json',
    '/metrics',
  ];

  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDurationSeconds: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { requestId?: string; userId?: number }>();
    const response = context.switchToHttp().getResponse<Response>();

    // 제외된 경로는 로깅하지 않음
    if (this.excludedPaths.some((path) => request.url.startsWith(path))) {
      return next.handle();
    }

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // 요청 정보 추출
    const userId = request.userId;
    const requestId = request.requestId || 'unknown';

    // 요청 로그
    this.logger.log(
      `[${requestId}] ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}${userId ? ` - UserId: ${userId}` : ''}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode: number = response.statusCode;
          const durationSeconds = duration / 1000;

          const routePath = (request.route as { path?: string })?.path;
          const path: string = routePath || request.path || url.split('?')[0];

          // 응답 로그
          const logMessage = `[${requestId}] ${method} ${url} ${statusCode} - ${duration}ms`;

          if (statusCode >= 500) {
            this.logger.error(logMessage);
          } else if (statusCode >= 400) {
            this.logger.warn(logMessage);
          } else {
            this.logger.log(logMessage);
          }

          this.recordMetrics(method, path, statusCode, durationSeconds);
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const durationSeconds = duration / 1000;
          const statusCode: number = this.extractStatusCode(
            error,
            response.statusCode,
          );

          const routePath = (request.route as { path?: string })?.path;
          const path: string = routePath || request.path || url.split('?')[0];
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;

          this.logger.error(
            `[${requestId}] ${method} ${url} ${statusCode} - ${duration}ms - Error: ${errorMessage}`,
            errorStack,
          );

          // 에러 응답에 대한 Prometheus 메트릭 기록
          this.recordMetrics(method, path, statusCode, durationSeconds);
        },
      }),
    );
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

  private recordMetrics(
    method: string,
    path: string,
    statusCode: number,
    durationSeconds: number,
  ) {
    if (!this.httpRequestsTotal || !this.httpRequestDurationSeconds) {
      this.logger.warn('Prometheus metrics not initialized; skipping metrics');
      return;
    }
    this.httpRequestsTotal.labels(method, path, String(statusCode)).inc();
    this.httpRequestDurationSeconds
      .labels(method, path, String(statusCode))
      .observe(durationSeconds);
  }
}
