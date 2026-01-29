import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchService } from './batch.service';
import { AudioAsset } from '../uploads/entities/audio-asset.entity';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([AudioAsset, AnswerSubmission]),
  ],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
