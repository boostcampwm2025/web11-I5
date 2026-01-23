import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';
import { UserRepository } from './user.repository';
import {
  hashPassword,
  isHashedPassword,
  verifyPassword,
} from './utils/password.util';
import { QueryFailedError } from 'typeorm';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { EvaluationStatus } from '../answer-evaluation/answer-evaluation.constants';
import { SolvedProblemDto } from './dtos/response/solved-problem.dto';
import { SolvedProblemsListResponseDto } from './dtos/response/solved-problems-list-response.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(AnswerSubmission)
    private readonly answerSubmissionRepository: Repository<AnswerSubmission>,
  ) {}

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOneById(id);
  }

  async createUser(params: {
    nickname: string;
    email: string;
    password: string;
  }): Promise<User> {
    const existingUserByEmail = await this.userRepository.findOneByEmail(
      params.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const existingUserByNickname = await this.userRepository.findOneByNickname(
      params.nickname,
    );
    if (existingUserByNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    try {
      return await this.userRepository.create({
        email: params.email,
        nickname: params.nickname,
        password: hashPassword(params.password),
        totalPoint: 0,
        totalScore: 0,
        role: UserRole.USER,
      });
    } catch (error) {
      // 레이스 컨디션 등으로 DB 유니크 제약에서 터질 수 있으므로 409로 변환
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: unknown;
          detail?: unknown;
        };
        if (driverError?.code === '23505') {
          const detail =
            typeof driverError.detail === 'string' ? driverError.detail : '';
          if (detail.includes('(email)')) {
            throw new ConflictException('이미 사용 중인 이메일입니다.');
          }
          if (detail.includes('(nickname)')) {
            throw new ConflictException('이미 사용 중인 닉네임입니다.');
          }
          throw new ConflictException('이미 사용 중인 값입니다.');
        }
      }
      throw error;
    }
  }

  // 이메일 + 비밀번호 기반 로그인
  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (!user.password || !verifyPassword(password, user.password)) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 레거시 평문 비밀번호였으면 로그인 성공 시 해시로 업그레이드
    if (user.password && !isHashedPassword(user.password)) {
      user.password = hashPassword(password);
      await this.userRepository.save(user);
    }

    return user;
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  /**
   * 채점 및 AI 피드백이 완료된 문제 목록 조회
   * @param userId 사용자 ID
   * @returns 푼 문제 목록 및 총 갯수
   */
  async getSolvedProblems(
    userId: number,
  ): Promise<SolvedProblemsListResponseDto> {
    // 채점 및 피드백이 완료된 제출 내역 조회
    const submissions = await this.answerSubmissionRepository
      .createQueryBuilder('submission')
      .innerJoin(
        'answer_evaluations',
        'evaluation',
        'evaluation.submission_id = submission.id',
      )
      .innerJoinAndSelect('submission.question', 'question')
      .leftJoinAndSelect('question.category', 'category')
      .where('submission.user_id = :userId', { userId })
      .andWhere('submission.evaluation_status = :status', {
        status: EvaluationStatus.COMPLETED,
      })
      .andWhere('evaluation.feedback_message IS NOT NULL')
      .orderBy('submission.submitted_at', 'DESC')
      .getMany();

    // 문제별로 가장 최근 제출 내역만 선택
    const problemMap = new Map<
      number,
      {
        submissionId: number;
        questionId: number;
        title: string;
        category: string;
        completedAt: Date;
        score: number;
      }
    >();

    submissions.forEach((submission) => {
      const questionId = submission.questionId;
      const existing = problemMap.get(questionId);

      if (!existing || submission.submittedAt > existing.completedAt) {
        const categoryName = submission.question?.category?.name ?? '미분류';

        problemMap.set(questionId, {
          submissionId: submission.id,
          questionId,
          title: submission.question?.title ?? '',
          category: categoryName,
          completedAt: submission.submittedAt,
          score: submission.score,
        });
      }
    });

    // DTO 변환 및 정렬
    const problems: SolvedProblemDto[] = Array.from(problemMap.values())
      .map((data) => ({
        questionId: data.questionId,
        title: data.title,
        category: data.category,
        completedAt: data.completedAt.toISOString(),
        reportId: data.submissionId,
        score: data.score,
      }))
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      );

    return {
      problems,
      totalCount: problems.length,
    };
  }
}
