/**
 * 시나리오 e2e용 앱 팩토리
 * - AppModule + 외부 의존성(Mail, ObjectStorage, Stt, Llm) 모킹
 * - 전역 ValidationPipe, ExceptionFilter, LoggingInterceptor 적용
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { MailService } from '../src/mail/mail.service';
import { ObjectStorageService } from '../src/object-storage/object-storage.service';
import { SttService } from '../src/stt/stt.service';
import { LlmService } from '../src/llm/llm.service';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
} from '../src/common/filters';
import {
  mockMailService,
  mockObjectStorageService,
  mockSttService,
  mockLlmService,
} from './e2e-mocks';

export async function createE2eApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue(mockMailService)
    .overrideProvider(ObjectStorageService)
    .useValue(mockObjectStorageService)
    .overrideProvider(SttService)
    .useValue(mockSttService)
    .overrideProvider(LlmService)
    .useValue(mockLlmService)
    .compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  return app;
}
