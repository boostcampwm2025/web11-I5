import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerSubmission } from 'src/answer-submission/entities/answer-submission.entity';
import { AuthModule } from '../auth/auth.module';
import { Streaks } from './entities/streaks.entity';
import { StreaksController } from './streaks.controller';
import { StreaksService } from './streaks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Streaks, AnswerSubmission]), AuthModule],
  controllers: [StreaksController],
  providers: [StreaksService],
  exports: [StreaksService],
})
export class StreaksModule {}
