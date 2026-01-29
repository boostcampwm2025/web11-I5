import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectStorageModule } from 'src/object-storage/object-storage.module';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { AuthModule } from '../auth/auth.module';
import { Question } from '../question/entities/question.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AnswerSubmission, Question]),
    AuthModule,
    ObjectStorageModule,
  ],
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
