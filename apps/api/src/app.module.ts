import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { BatchModule } from './batch/batch.module';
import { RequestIdMiddleware } from './common/middlewares';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmModuleOptions),
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
    BatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 모든 경로에 Request ID Middleware 적용
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
