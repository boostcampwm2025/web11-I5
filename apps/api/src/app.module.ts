import { Module } from '@nestjs/common';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
