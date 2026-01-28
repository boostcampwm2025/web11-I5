import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { ObjectStorageService } from 'src/object-storage/object-storage.service';
import { QueryFailedError, Repository } from 'typeorm';
import { EvaluationStatus } from '../answer-evaluation/answer-evaluation.constants';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { EditUserRequestDto } from './dtos/request/edit-user.request.dto';
import { SolvedProblemDto } from './dtos/response/solved-problem.dto';
import { SolvedProblemsListResponseDto } from './dtos/response/solved-problems-list-response.dto';
import { UserRole } from './entities/user-role.enum';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import {
  hashPassword,
  isHashedPassword,
  verifyPassword,
} from './utils/password.util';

@Injectable()
export class UserService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UserService.name);
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly objectStorageService: ObjectStorageService,
    @InjectRepository(AnswerSubmission)
    private readonly answerSubmissionRepository: Repository<AnswerSubmission>,
  ) {}

  // 메시지큐 대신 사용할 맵
  private uploadSessions = new Map<
    string,
    { userId: number; expiresAt: Date }
  >();

  // 5분마다 uploadSession 초기화
  onModuleInit() {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredSessions();
      },
      5 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private cleanupExpiredSessions() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, session] of this.uploadSessions.entries()) {
      if (session.expiresAt <= now) {
        this.uploadSessions.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} expired upload sessions`);
    }
  }

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

    // profileImage의 objectKey를 S3 URL로 변환
    if (user.profileImage) {
      user.profileImage = await this.objectStorageService.createPresignedGetUrl(
        user.profileImage,
      );
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
      .orderBy('submission.score', 'DESC')
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

  async requestPresignedUrl(userId: number, contentType?: string) {
    // Content-Type 허용 리스트
    const allowedContentTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const finalContentType = contentType || 'image/jpeg';

    if (!allowedContentTypes.includes(finalContentType)) {
      throw new BadRequestException(
        `지원하지 않는 Content-Type입니다. 허용: ${allowedContentTypes.join(', ')}`,
      );
    }

    const sessionId = randomUUID();
    const objectKey = `profile-images/${sessionId}`;

    this.uploadSessions.set(objectKey, {
      userId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      const { uploadUrl, expiresIn } =
        await this.objectStorageService.createPresignedPutUrl(
          objectKey,
          finalContentType,
        );

      return {
        uploadUrl,
        objectKey,
        expiresIn,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create presigned URL for user ${userId}`,
        error,
      );
      throw new InternalServerErrorException(
        '프로필 이미지 업로드 URL 생성에 실패했습니다.',
      );
    }
  }

  async editUser(
    userId: number,
    editUserRequestDto: EditUserRequestDto,
  ): Promise<User> {
    if (
      !editUserRequestDto.nickname &&
      editUserRequestDto.objectKey === undefined
    ) {
      throw new BadRequestException('수정할 정보를 입력해주세요.');
    }

    const userInfo = await this.findOneById(userId);
    if (!userInfo) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    let hasChanges = false;
    const oldProfileImageKey = userInfo.profileImage;

    // 이미지 변경시
    if (editUserRequestDto.objectKey !== undefined) {
      if (editUserRequestDto.objectKey === null) {
        // 삭제 처리 -> DB의 profileImage ObjectKey = null
        userInfo.profileImage = null;
        hasChanges = true;
      } else {
        // 새로운 이미지 -> 업로드 확인
        await this.verifyNewProfileImage(editUserRequestDto.objectKey, userId);

        userInfo.profileImage = editUserRequestDto.objectKey;
        this.uploadSessions.delete(editUserRequestDto.objectKey);
        hasChanges = true;
      }
    }

    // 닉네임 변경시
    if (
      editUserRequestDto.nickname &&
      editUserRequestDto.nickname !== userInfo.nickname
    ) {
      const existingUser = await this.userRepository.findOneByNickname(
        editUserRequestDto.nickname,
      );

      if (existingUser) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }

      userInfo.nickname = editUserRequestDto.nickname;
      hasChanges = true;
    }

    if (hasChanges) {
      try {
        const savedUser = await this.userRepository.save(userInfo);

        // DB 저장 성공 후 오래된 이미지 cleanup
        if (
          editUserRequestDto.objectKey !== undefined &&
          oldProfileImageKey &&
          oldProfileImageKey !== savedUser.profileImage
        ) {
          this.cleanupOldProfileImage(oldProfileImageKey);
        }

        // profileImage를 objectKey에서 URL로 변환
        if (savedUser.profileImage) {
          savedUser.profileImage =
            await this.objectStorageService.createPresignedGetUrl(
              savedUser.profileImage,
            );
        }

        return savedUser;
      } catch (error) {
        // 레이스 컨디션 처리
        if (error instanceof QueryFailedError) {
          const driverError = error.driverError as {
            code?: unknown;
            detail?: unknown;
          };
          if (driverError?.code === '23505') {
            const detail =
              typeof driverError.detail === 'string' ? driverError.detail : '';
            if (detail.includes('(nickname)')) {
              throw new ConflictException('이미 사용 중인 닉네임입니다.');
            }
          }
        }
        throw error;
      }
    }

    // profileImage를 objectKey에서 URL로 변환
    if (userInfo.profileImage) {
      userInfo.profileImage =
        await this.objectStorageService.createPresignedGetUrl(
          userInfo.profileImage,
        );
    }

    return userInfo;
  }

  /**
   * presigned URL로 이미지가 업로드 되었는지 확인
   */
  private async verifyNewProfileImage(objectKey: string, userId: number) {
    const session = this.uploadSessions.get(objectKey);

    if (
      !session ||
      session.userId !== userId ||
      session.expiresAt <= new Date()
    ) {
      throw new BadRequestException('유효하지 않은 이미지 세션입니다.');
    }

    try {
      const { exists } =
        await this.objectStorageService.verifyFileExists(objectKey);
      if (!exists) {
        throw new BadRequestException('이미지가 업로드되지 않았습니다.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to verify file: ${objectKey}`, error);
      throw new InternalServerErrorException('이미지 검증에 실패하였습니다.');
    }
  }

  /**
   * 오래된 프로필 이미지를 S3에서 삭제
   */
  private cleanupOldProfileImage(oldImageKey: string): void {
    // await 하지 않고 사용자 요청은 빠르게 처리될 수 있게 하기
    void this.objectStorageService.deleteObject(oldImageKey).catch((err) => {
      this.logger.error(
        `Failed to delete old profile image: ${oldImageKey}`,
        err,
      );
    });
  }
}
