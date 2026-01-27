import { ExecutionContext, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createExecutionContext = ({
    url = '/test',
    method = 'GET',
    statusCode = 200,
  } = {}): ExecutionContext => {
    const request = {
      url,
      method,
      ip: '127.0.0.1',
      get: () => 'jest-agent',
    } as unknown as Request;

    const response = {
      statusCode,
    } as unknown as Response;

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;
  };

  it('정상 요청에 대해 요청/응답 로그를 남긴다', (done) => {
    const context = createExecutionContext({ statusCode: 200 });

    const next = {
      handle: () => of('ok'),
    };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockLogger.log).toHaveBeenCalled();
        expect(mockLogger.warn).not.toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('4xx 응답일 경우 warn 로그를 남긴다', (done) => {
    const context = createExecutionContext({ statusCode: 400 });

    const next = {
      handle: () => of('bad request'),
    };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockLogger.warn).toHaveBeenCalled();
        done();
      },
    });
  });

  it('5xx 응답일 경우 error 로그를 남긴다', (done) => {
    const context = createExecutionContext({ statusCode: 500 });

    const next = {
      handle: () => of('server error'),
    };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockLogger.error).toHaveBeenCalled();
        done();
      },
    });
  });

  it('에러 발생 시 error 로그를 남기고 에러를 다시 throw 한다', (done) => {
    const context = createExecutionContext();

    const error = new Error('boom');

    const next = {
      handle: () => throwError(() => error),
    };

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err).toBe(error);
        expect(mockLogger.error).toHaveBeenCalled();
        done();
      },
    });
  });

  it('제외된 경로는 로깅하지 않는다', (done) => {
    const context = createExecutionContext({ url: '/health' });

    const next = {
      handle: () => of('ok'),
    };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockLogger.log).not.toHaveBeenCalled();
        expect(mockLogger.warn).not.toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
