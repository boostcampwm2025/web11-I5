import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerSubmissionController } from './answer-submission.controller';
import { AnswerSubmissionService } from './answer-submission.service';
import { AudioAsset } from '../audio-stream/entities/audio-asset.entity';
import { Question } from '../question/entities/question.entity';
import { SttModule } from '../stt/stt.module';
import { AnswerSubmission } from './entities/answer-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnswerSubmission, AudioAsset, Question]),
    forwardRef(() => SttModule),
  ],
  controllers: [AnswerSubmissionController],
  providers: [AnswerSubmissionService],
  exports: [AnswerSubmissionService, TypeOrmModule],
})
export class AnswerSubmissionModule {}
