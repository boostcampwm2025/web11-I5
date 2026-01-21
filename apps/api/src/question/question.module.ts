import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { CategoryModule } from '../category/category.module';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question]), CategoryModule, AuthModule],
  providers: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
