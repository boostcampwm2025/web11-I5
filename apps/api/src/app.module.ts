import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { AnswerEvaluationModule } from './answer-evaluation/answer-evaluation.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmModuleOptions } from './configs/typeorm.config';
import { StreaksModule } from './streaks/streaks.module';
import { UserModule } from './user/user.module';
import { SttModule } from './stt/stt.module';
import { ObjectStorageModule } from './object-storage/object-storage.module';
import { CategoryModule } from './category/category.module';
import { QuestionModule } from './question/question.module';
import { AnswerSubmissionModule } from './answer-submission/answer-submission.module';
import { GraphModule } from './graph/graph.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { RequestIdMiddleware } from './common/middlewares';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    // Prometheus 기본 설정 사용 (기본 메트릭 자동 수집)
    PrometheusModule.register(),
    AuthModule,
    UserModule,
    AnswerEvaluationModule,
    CategoryModule,
    QuestionModule,
    GraphModule,
    StreaksModule,
    SttModule,
    ObjectStorageModule,
    AnswerSubmissionModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggingInterceptor,
    // HTTP 요청 수 카운터 메트릭
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    }),
    // HTTP 응답 시간 히스토그램 메트릭 (초 단위)
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 모든 경로에 Request ID Middleware 적용
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
