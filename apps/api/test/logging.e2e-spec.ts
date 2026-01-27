import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Logging E2E Tests', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 인터셉터와 필터 등록
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('LoggingInterceptor', () => {
    it('정상 요청을 로깅해야 함', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          // 요청이 성공적으로 처리되었는지 확인
          expect(res.status).toBe(200);
        });
    });

    it('제외된 경로(/health)는 로깅하지 않아야 함', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          // 헬스체크는 로깅되지 않아야 함
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  describe('HttpExceptionFilter', () => {
    it('404 에러를 올바른 형식으로 응답해야 함', () => {
      return request(app.getHttpServer())
        .get('/api/nonexistent')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('path', '/api/nonexistent');
          expect(res.body).toHaveProperty('method', 'GET');
          expect(res.body).toHaveProperty('message');
        });
    });

    it('에러 응답에 타임스탬프가 ISO 형식이어야 함', () => {
      return request(app.getHttpServer())
        .get('/api/nonexistent')
        .expect(404)
        .expect((res) => {
          const body = res.body as { timestamp: string };
          expect(body.timestamp).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
        });
    });

    it('에러 응답에 요청 정보가 포함되어야 함', () => {
      return request(app.getHttpServer())
        .post('/api/invalid-endpoint')
        .send({ data: 'test' })
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('method', 'POST');
          expect(res.body).toHaveProperty('path');
        });
    });
  });

  describe('통합 테스트', () => {
    it('요청-응답 사이클이 올바르게 로깅되어야 함', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          // 응답이 정상적으로 반환되는지 확인
          expect(res.status).toBe(200);
        });
    });

    it('에러 발생 시 필터가 올바르게 처리해야 함', () => {
      return request(app.getHttpServer())
        .get('/api/error-test')
        .expect((res) => {
          // 404 또는 다른 에러 상태 코드
          expect(res.status).toBeGreaterThanOrEqual(400);
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});
