import { Logger, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreaksModule } from 'src/streaks/streaks.module';
import { AudioAsset } from '../audio-stream/entities/audio-asset.entity';
import { Question } from '../question/entities/question.entity';
import { SttModule } from '../stt/stt.module';
import { AnswerSubmissionController } from './answer-submission.controller';
import { AnswerSubmissionService } from './answer-submission.service';
import { AnswerSubmission } from './entities/answer-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnswerSubmission, AudioAsset, Question]),
    forwardRef(() => SttModule),
    StreaksModule,
  ],
  controllers: [AnswerSubmissionController],
  providers: [
    AnswerSubmissionService,
    {
      provide: Logger,
      useFactory: () => new Logger(AnswerSubmissionService.name),
    },
  ],
  exports: [AnswerSubmissionService, TypeOrmModule],
})
export class AnswerSubmissionModule {}
