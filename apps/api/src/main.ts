import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter, HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  // Logger 설정
  const nodeEnv = process.env.NODE_ENV || 'development';
  const loggerOptions: (
    | 'debug'
    | 'verbose'
    | 'error'
    | 'warn'
    | 'log'
    | 'fatal'
  )[] =
    nodeEnv === 'production'
      ? ['error', 'warn', 'log'] // 프로덕션: DEBUG 제외
      : ['error', 'warn', 'log', 'debug', 'verbose']; // 개발: 모든 레벨

  const app = await NestFactory.create(AppModule, {
    logger: loggerOptions,
  });

  // 전역 인터셉터 및 필터 설정
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // ValidationPipe 전역 설정
  app.useGlobalPipes(new ValidationPipe());

  // 쿠키 파서 (개발용)
  app.use(cookieParser());

  // CORS 설정 (개발용)
  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  // Swagger 설정 (로컬/개발 환경에서만 노출)
  const isSwaggerEnabled = nodeEnv === 'development' || nodeEnv === 'local';

  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('MMH API')
      .setDescription('MMH API 문서')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Access Token을 입력하세요',
          in: 'header',
        },
        'JWT-auth', // 컨트롤러에서 사용
      )
      .addTag('users', '사용자 관련 API')
      .addTag('streaks', '스트릭 관련 API')
      .addTag('audio-stream', '오디오 스트리밍 관련 API')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    // OpenAPI 스펙 JSON 엔드포인트
    app
      .getHttpAdapter()
      .get('/api-docs-json', (_req: Request, res: Response) => {
        res.json(document);
      });
  }

  const port = process.env.PORT ?? 8000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  if (isSwaggerEnabled) {
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api-docs`);
  }
  logger.log(`🌍 Environment: ${nodeEnv}`);
}
void bootstrap();
