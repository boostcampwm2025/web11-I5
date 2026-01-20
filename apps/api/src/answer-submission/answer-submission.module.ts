import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreaksModule } from 'src/streaks/streaks.module';
import { AudioAsset } from '../audio-stream/entities/audio-asset.entity';
import { Question } from '../question/entities/question.entity';
import { SttModule } from '../stt/stt.module';
import { AnswerSubmissionController } from './answer-submission.controller';
import { AnswerSubmissionService } from './answer-submission.service';
import { AnswerSubmission } from './entities/answer-submission.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnswerSubmission, AudioAsset, Question]),
    forwardRef(() => SttModule),
    StreaksModule,
    AuthModule,
  ],
  controllers: [AnswerSubmissionController],
  providers: [AnswerSubmissionService],
  exports: [AnswerSubmissionService],
})
export class AnswerSubmissionModule {}
