import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerSubmissionModule } from 'src/answer-submission/answer-submission.module';
import { AuthModule } from '../auth/auth.module';
import { Streaks } from './entities/streaks.entity';
import { StreaksController } from './streaks.controller';
import { StreaksService } from './streaks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Streaks]),
    forwardRef(() => AnswerSubmissionModule),
    AuthModule,
  ],
  controllers: [StreaksController],
  providers: [StreaksService],
  exports: [StreaksService],
})
export class StreaksModule {}
