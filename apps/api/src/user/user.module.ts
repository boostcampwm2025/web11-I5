import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { Question } from '../question/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AnswerSubmission, Question]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
