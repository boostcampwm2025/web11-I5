import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockRequest = {
    method: 'GET',
    url: '/test',
    ip: '127.0.0.1',
  };

  const mockArgumentsHost = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    }),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('4xx HttpException 발생 시 warn 로그를 남기고 응답을 반환한다', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockLogger.warn).toHaveBeenCalled();
    expect(mockLogger.error).not.toHaveBeenCalled();

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        path: '/test',
        method: 'GET',
        message: 'Bad Request',
      }),
    );
  });

  it('5xx HttpException 발생 시 error 로그를 남긴다', () => {
    const exception = new HttpException(
      'Internal Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockLogger.warn).not.toHaveBeenCalled();

    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it('일반 Error 발생 시 500으로 처리하고 error 로그를 남긴다', () => {
    const exception = new Error('Unexpected failure');

    filter.catch(exception, mockArgumentsHost);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockLogger.warn).not.toHaveBeenCalled();

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });
});
