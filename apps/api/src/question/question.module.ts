import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerSubmissionModule } from 'src/answer-submission/answer-submission.module';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { User } from '../user/entities/user.entity';
import { Question } from './entities/question.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, User]),
    CategoryModule,
    AuthModule,
    AnswerSubmissionModule,
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
