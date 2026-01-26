import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LlmModule } from '../llm/llm.module';
import { GraphModule } from '../graph/graph.module';
import { AnswerEvaluationService } from './answer-evaluation.service';
import { AnswerEvaluationController } from './answer-evaluation.controller';
import { AnswerEvaluation } from './entities/answer-evaluation.entity';
import { AnswerSubmission } from 'src/answer-submission/entities/answer-submission.entity';
import { Question } from 'src/question/entities/question.entity';
import { QuestionSolution } from 'src/question-solution/entities/question-solution.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnswerEvaluation,
      AnswerSubmission,
      Question,
      QuestionSolution,
    ]),
    ConfigModule,
    LlmModule,
    GraphModule,
  ],
  controllers: [AnswerEvaluationController],
  providers: [AnswerEvaluationService],
  exports: [AnswerEvaluationService],
})
export class AnswerEvaluationModule {}
