import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { ObjectStorageService } from 'src/object-storage/object-storage.service';
import { QueryFailedError, Repository } from 'typeorm';
import { EvaluationStatus } from '../answer-evaluation/answer-evaluation.constants';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { GoogleProfile } from '../auth/strategies/google.strategy';
import { EditUserRequestDto } from './dtos/request/edit-user.request.dto';
import { SolvedProblemDto } from './dtos/response/solved-problem.dto';
import { SolvedProblemsListResponseDto } from './dtos/response/solved-problems-list-response.dto';
import { AuthProvider } from './entities/auth-provider.enum';
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
    private readonly mailService: MailService,
  ) {}

  // 메시지큐 대신 사용할 맵
  private uploadSessions = new Map<
    string,
    { userId: number; expiresAt: Date }
  >();

  private verifySessions = new Map<
    string,
    { code: string; verified: boolean; expiresAt: Date; attempts: number }
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
    let uploadCleanedCount = 0;
    let verifyCleanedCount = 0;

    for (const [key, session] of this.uploadSessions.entries()) {
      if (session.expiresAt <= now) {
        this.uploadSessions.delete(key);
        uploadCleanedCount++;
      }
    }

    for (const [key, session] of this.verifySessions.entries()) {
      if (session.expiresAt <= now) {
        this.verifySessions.delete(key);
        verifyCleanedCount++;
      }
    }

    if (uploadCleanedCount > 0) {
      this.logger.log(
        `Cleaned up ${uploadCleanedCount} expired upload sessions`,
      );
    }
    if (verifyCleanedCount > 0) {
      this.logger.log(
        `Cleaned up ${verifyCleanedCount} expired verification sessions`,
      );
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
    const isVerifiedMail = this.verifySessions.get(params.email);
    if (!isVerifiedMail || !isVerifiedMail.verified) {
      throw new BadRequestException('이메일 인증이 필요합니다.');
    }

    const existingUserByNickname = await this.userRepository.findOneByNickname(
      params.nickname,
    );
    if (existingUserByNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    try {
      const newUser = await this.userRepository.create({
        email: params.email,
        nickname: params.nickname,
        password: hashPassword(params.password),
        totalPoint: 0,
        totalScore: 0,
        role: UserRole.USER,
      });

      this.verifySessions.delete(params.email);

      return newUser;
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

    // OAuth 사용자인 경우 비밀번호 로그인 불가
    if (!user.password) {
      throw new UnauthorizedException(
        '이 계정은 소셜 로그인으로 가입되었습니다. Google 로그인을 이용해주세요.',
      );
    }

    if (!verifyPassword(password, user.password)) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 레거시 평문 비밀번호였으면 로그인 성공 시 해시로 업그레이드
    if (!isHashedPassword(user.password)) {
      user.password = hashPassword(password);
      await this.userRepository.save(user);
    }

    return user;
  }

  /**
   * Google OAuth 사용자 찾기 또는 생성
   * @param profile Google OAuth 프로필
   * @returns 사용자 엔티티
   */
  async findOrCreateGoogleUser(profile: GoogleProfile): Promise<User> {
    // 1. googleId로 사용자 검색
    const existingUserByGoogleId = await this.userRepository.findOneByGoogleId(
      profile.googleId,
    );
    if (existingUserByGoogleId) {
      return existingUserByGoogleId;
    }

    // 2. email로 사용자 검색 (계정 연동 처리)
    const existingUserByEmail = await this.userRepository.findOneByEmail(
      profile.email,
    );

    if (existingUserByEmail) {
      // LOCAL 사용자면 Google 계정 연동
      existingUserByEmail.googleId = profile.googleId;
      return this.userRepository.save(existingUserByEmail);
    }

    // 3. 새 사용자 생성
    const nickname = await this.generateUniqueNickname(profile.displayName);

    const newUser = await this.userRepository.create({
      email: profile.email,
      nickname,
      googleId: profile.googleId,
      profileImage: profile.profileImage,
      password: null,
      authProvider: AuthProvider.GOOGLE,
      totalPoint: 0,
      totalScore: 0,
      role: UserRole.USER,
    });

    return newUser;
  }

  /**
   * 고유한 닉네임 생성
   * 중복 시 숫자 suffix 추가
   */
  private async generateUniqueNickname(baseName: string): Promise<string> {
    // 공백 제거 및 최대 20자 제한
    let nickname = baseName.replace(/\s+/g, '').substring(0, 20);
    if (!nickname) {
      nickname = 'User';
    }

    let suffix = 0;
    let candidateNickname = nickname;

    while (await this.userRepository.findOneByNickname(candidateNickname)) {
      suffix++;
      candidateNickname = `${nickname.substring(0, 17)}${suffix}`;
    }

    return candidateNickname;
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // profileImage의 objectKey를 S3 URL로 변환 (외부 URL인 경우 그대로 사용)
    if (user.profileImage && !this.isExternalUrl(user.profileImage)) {
      user.profileImage = await this.objectStorageService.createPresignedGetUrl(
        user.profileImage,
      );
    }

    return user;
  }

  /**
   * 외부 URL인지 확인 (Google 프로필 이미지 등)
   */
  private isExternalUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * 채점·피드백 완료된 제출 중 문제별 최근 제출 ID 목록 조회 (raw SQL)
   */
  private async findLatestSolvedSubmissionIds(
    userId: number,
  ): Promise<number[]> {
    const rows = await this.answerSubmissionRepository.manager.query<
      { id: number }[]
    >(
      `
      SELECT DISTINCT ON (sub.question_id) sub.id
      FROM answer_submissions sub
      INNER JOIN answer_evaluations eval ON eval.submission_id = sub.id
      WHERE sub.user_id = $1
        AND sub.evaluation_status = $2
        AND eval.feedback_message IS NOT NULL
      ORDER BY sub.question_id, sub.submitted_at DESC
    `,
      [userId, EvaluationStatus.COMPLETED],
    );
    return Array.isArray(rows) ? rows.map((row) => row.id) : [];
  }

  /**
   * 채점 및 AI 피드백이 완료된 문제 목록 조회 (페이지네이션 적용)
   * @param userId 사용자 ID
   * @param page 페이지 번호 (기본값: 1)
   * @param size 페이지 크기 (기본값: 10)
   * @returns 푼 문제 목록 및 페이지네이션 정보
   */
  async getSolvedProblems(
    userId: number,
    page: number = 1,
    size: number = 10,
  ): Promise<SolvedProblemsListResponseDto> {
    const submissionIds = await this.findLatestSolvedSubmissionIds(userId);

    if (submissionIds.length === 0) {
      return {
        problems: [],
        totalCount: 0,
        currentPage: page,
        pageSize: size,
        totalPages: 0,
      };
    }

    // 조회된 제출 ID로 상세 정보 조회 (페이지네이션 적용)
    const queryBuilder = this.answerSubmissionRepository
      .createQueryBuilder('submission')
      .innerJoinAndSelect('submission.question', 'question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .where('submission.id IN (:...submissionIds)', { submissionIds })
      .orderBy('submission.submittedAt', 'DESC'); // 최신 풀이순 정렬

    // 전체 개수 조회 (페이지네이션 적용 전)
    const totalCount = await queryBuilder.getCount();

    // 페이지네이션 적용
    const skip = (page - 1) * size;
    const submissions = await queryBuilder.skip(skip).take(size).getMany();

    // DTO 변환
    const problems: SolvedProblemDto[] = submissions.map((submission) => ({
      questionId: submission.questionId,
      title: submission.question?.title ?? '',
      category: submission.question?.category?.name ?? '미분류',
      parentCategory: submission.question?.category?.parent?.name ?? '미분류',
      completedAt: submission.submittedAt.toISOString(),
      reportId: submission.id,
      score: submission.score,
    }));

    const totalPages = Math.ceil(totalCount / size);

    return {
      problems,
      totalCount,
      currentPage: page,
      pageSize: size,
      totalPages,
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

        // profileImage를 objectKey에서 URL로 변환 (외부 URL인 경우 그대로 사용)
        if (
          savedUser.profileImage &&
          !this.isExternalUrl(savedUser.profileImage)
        ) {
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

    // profileImage를 objectKey에서 URL로 변환 (외부 URL인 경우 그대로 사용)
    if (userInfo.profileImage && !this.isExternalUrl(userInfo.profileImage)) {
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

  private async sendVerificationCode(email: string) {
    //6자리 랜덤 코드
    const code = randomBytes(3).toString('hex');

    try {
      await this.mailService.sendVerificationEmail(email, code);
      return code;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw new InternalServerErrorException(
        '인증 메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }

  async requestVerificationCode(email: string) {
    const existingUserByEmail = await this.userRepository.findOneByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const code = await this.sendVerificationCode(email);
    this.verifySessions.set(email, {
      code,
      verified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
    });
  }

  checkVerificationCode(email: string, code: string) {
    const userVerifyItem = this.verifySessions.get(email);

    if (!userVerifyItem) {
      throw new ForbiddenException('해당 메일로 요청을 보내지 않았습니다.');
    }

    // 만료 시간 체크
    if (userVerifyItem.expiresAt <= new Date()) {
      this.verifySessions.delete(email);
      throw new ForbiddenException(
        '인증 코드가 만료되었습니다. 다시 인증 코드를 요청해주세요.',
      );
    }

    // 시도 횟수 제한 체크 (5회)
    if (userVerifyItem.attempts >= 5) {
      this.verifySessions.delete(email);
      throw new ForbiddenException(
        '인증 시도 횟수를 초과했습니다. 다시 인증 코드를 요청해주세요.',
      );
    }

    const originalCode = userVerifyItem.code;
    if (originalCode === code) {
      this.verifySessions.set(email, { ...userVerifyItem, verified: true });
      return;
    }

    this.verifySessions.set(email, {
      ...userVerifyItem,
      attempts: userVerifyItem.attempts + 1,
    });

    throw new BadRequestException('잘못 입력했습니다.');
  }
}
