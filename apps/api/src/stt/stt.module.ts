import { Module, forwardRef } from '@nestjs/common';
import { AnswerSubmissionModule } from 'src/answer-submission/answer-submission.module';
import { SttController } from './stt.controller';
import { SttService } from './stt.service';
import { AnswerEvaluationModule } from 'src/answer-evaluation/answer-evaluation.module';
import { LlmModule } from 'src/llm/llm.module';

@Module({
  imports: [
    AnswerEvaluationModule,
    LlmModule,
    forwardRef(() => AnswerSubmissionModule),
  ],
  controllers: [SttController],
  providers: [SttService],
  exports: [SttService],
})
export class SttModule {}
