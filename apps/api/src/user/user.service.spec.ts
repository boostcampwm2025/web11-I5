/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';
import { ObjectStorageService } from '../object-storage/object-storage.service';
import { MailService } from '../mail/mail.service';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { hashPassword } from './utils/password.util';
import { EditUserRequestDto } from './dtos/request/edit-user.request.dto';

const mockUserRepository = {
  findOneById: jest.fn(),
  findOneByNickname: jest.fn(),
  findOneByEmail: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockObjectStorageService = {
  createPresignedPutUrl: jest.fn(),
  createPresignedGetUrl: jest.fn(),
  verifyFileExists: jest.fn(),
  deleteObject: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

const mockQueryBuilder = {
  innerJoin: jest.fn().mockReturnThis(),
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getCount: jest.fn(),
  getMany: jest.fn(),
};

const mockAnswerSubmissionRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  manager: {
    query: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let objectStorageService: ObjectStorageService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ObjectStorageService,
          useValue: mockObjectStorageService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: getRepositoryToken(AnswerSubmission),
          useValue: mockAnswerSubmissionRepository,
        },
        {
          provide: Logger,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    objectStorageService =
      module.get<ObjectStorageService>(ObjectStorageService);
    mailService = module.get<MailService>(MailService);

    // onModuleInit에서 setInterval을 사용하므로 타이머를 모킹
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('findOneById', () => {
    it('id로 유저를 조회해야 한다', async () => {
      const id = 1;
      const mockUser = { id, email: 'a@b.com', nickname: 'user' } as User;

      mockUserRepository.findOneById.mockResolvedValue(mockUser);

      const result = await service.findOneById(id);

      expect(userRepository.findOneById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });

    it('없는 id면 null을 반환해야 한다', async () => {
      mockUserRepository.findOneById.mockResolvedValue(null);

      const result = await service.findOneById(999);

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('이메일 인증이 완료된 경우 유저를 생성해야 한다', async () => {
      const params = {
        nickname: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };
      const svc = service as unknown as {
        verifySessions: Map<
          string,
          { code: string; verified: boolean; expiresAt: Date; attempts: number }
        >;
      };
      svc.verifySessions.set(params.email, {
        code: 'x',
        verified: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
      });

      const createdUser = {
        id: 1,
        email: params.email,
        nickname: params.nickname,
        password: hashPassword(params.password),
        role: UserRole.USER,
      } as User;

      mockUserRepository.findOneByNickname.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await service.createUser(params);

      expect(userRepository.findOneByNickname).toHaveBeenCalledWith(
        params.nickname,
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: params.email,
          nickname: params.nickname,
          role: UserRole.USER,
        }),
      );
      expect(result).toEqual(createdUser);
    });

    it('이메일 인증이 되지 않았으면 BadRequestException을 발생시켜야 한다', async () => {
      const params = {
        nickname: 'newuser',
        email: 'notverified@example.com',
        password: 'password123',
      };

      await expect(service.createUser(params)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createUser(params)).rejects.toThrow(
        '이메일 인증이 필요합니다.',
      );
    });

    it('이미 사용 중인 닉네임이면 ConflictException을 발생시켜야 한다', async () => {
      const params = {
        nickname: 'taken',
        email: 'new@example.com',
        password: 'password123',
      };
      const svc = service as unknown as {
        verifySessions: Map<
          string,
          { code: string; verified: boolean; expiresAt: Date; attempts: number }
        >;
      };
      svc.verifySessions.set(params.email, {
        code: 'x',
        verified: true,
        expiresAt: new Date(Date.now() + 1e6),
        attempts: 0,
      });

      mockUserRepository.findOneByNickname.mockResolvedValue({ id: 1 } as User);

      await expect(service.createUser(params)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createUser(params)).rejects.toThrow(
        '이미 사용 중인 닉네임입니다.',
      );
    });
  });

  describe('login', () => {
    it('이메일·비밀번호가 맞으면 유저를 반환해야 한다', async () => {
      const email = 'user@example.com';
      const password = 'correct';
      const hashed = hashPassword(password);
      const mockUser = {
        id: 1,
        email,
        nickname: 'user',
        password: hashed,
      } as User;

      mockUserRepository.findOneByEmail.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.login(email, password);

      expect(userRepository.findOneByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('유저가 없으면 NotFoundException을 발생시켜야 한다', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.login('nonexistent@example.com', 'pass'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.login('nonexistent@example.com', 'pass'),
      ).rejects.toThrow('유저를 찾을 수 없습니다.');
    });

    it('비밀번호가 틀리면 UnauthorizedException을 발생시켜야 한다', async () => {
      const email = 'user@example.com';
      const mockUser = {
        id: 1,
        email,
        password: hashPassword('right'),
      } as User;

      mockUserRepository.findOneByEmail.mockResolvedValue(mockUser);

      await expect(service.login(email, 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(email, 'wrong')).rejects.toThrow(
        '비밀번호가 일치하지 않습니다.',
      );
    });
  });

  describe('getCurrentUser', () => {
    it('userId로 유저를 조회하고 profileImage가 있으면 Presigned GET URL로 변환해야 한다', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'u@b.com',
        nickname: 'u',
        profileImage: 'profile-images/key',
      } as User;

      mockUserRepository.findOneById.mockResolvedValue(mockUser);
      mockObjectStorageService.createPresignedGetUrl.mockResolvedValue(
        'https://signed-url.example/get',
      );

      const result = await service.getCurrentUser(userId);

      expect(userRepository.findOneById).toHaveBeenCalledWith(userId);
      expect(objectStorageService.createPresignedGetUrl).toHaveBeenCalledWith(
        'profile-images/key',
      );
      expect(result.profileImage).toBe('https://signed-url.example/get');
    });

    it('유저가 없으면 NotFoundException을 발생시켜야 한다', async () => {
      mockUserRepository.findOneById.mockResolvedValue(null);

      await expect(service.getCurrentUser(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getCurrentUser(999)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });
  });

  describe('getSolvedProblems', () => {
    it('채점·피드백 완료된 제출을 문제별 최신만 모아 DTO로 반환해야 한다', async () => {
      const userId = 1;
      const submittedAt = new Date('2025-01-15T10:00:00Z');
      const mockSubmissions = [
        {
          id: 1,
          userId,
          questionId: 10,
          score: 80,
          submittedAt,
          question: { id: 10, title: '질문1', category: { name: '카테고리A' } },
        },
      ] as unknown as AnswerSubmission[];

      mockAnswerSubmissionRepository.manager.query.mockResolvedValue([
        { id: 1 },
      ]);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockSubmissions);

      const result = await service.getSolvedProblems(userId);

      expect(mockAnswerSubmissionRepository.manager.query).toHaveBeenCalled();
      expect(
        mockAnswerSubmissionRepository.createQueryBuilder,
      ).toHaveBeenCalledWith('submission');
      expect(result.problems).toHaveLength(1);
      expect(result.problems[0].questionId).toBe(10);
      expect(result.problems[0].title).toBe('질문1');
      expect(result.problems[0].category).toBe('카테고리A');
      expect(result.totalCount).toBe(1);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('requestPresignedUrl', () => {
    it('허용된 Content-Type이면 Presigned PUT URL을 반환해야 한다', async () => {
      const userId = 1;
      mockObjectStorageService.createPresignedPutUrl.mockResolvedValue({
        uploadUrl: 'https://put.url',
        expiresIn: 600,
      });

      const result = await service.requestPresignedUrl(userId, 'image/png');

      expect(objectStorageService.createPresignedPutUrl).toHaveBeenCalledWith(
        expect.stringMatching(/^profile-images\//),
        'image/png',
      );
      expect(result.uploadUrl).toBe('https://put.url');
      expect(result.expiresIn).toBe(600);
    });

    it('지원하지 않는 Content-Type이면 BadRequestException을 발생시켜야 한다', async () => {
      await expect(service.requestPresignedUrl(1, 'image/gif')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.requestPresignedUrl(1, 'image/gif')).rejects.toThrow(
        '지원하지 않는 Content-Type입니다.',
      );
    });
  });

  describe('requestVerificationCode', () => {
    it('이미 사용 중인 이메일이면 ConflictException을 발생시켜야 한다', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue({ id: 1 } as User);

      await expect(
        service.requestVerificationCode('existing@example.com'),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.requestVerificationCode('existing@example.com'),
      ).rejects.toThrow('이미 사용 중인 이메일입니다.');
    });

    it('새 이메일이면 인증 코드를 발송하고 세션에 저장해야 한다', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(null);
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      await service.requestVerificationCode('new@example.com');

      expect(userRepository.findOneByEmail).toHaveBeenCalledWith(
        'new@example.com',
      );
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        'new@example.com',
        expect.any(String),
      );
    });
  });

  describe('checkVerificationCode', () => {
    it('올바른 코드면 verified를 true로 설정해야 한다', () => {
      const email = 'check@example.com';
      const code = 'ABC123';
      const svc = service as unknown as {
        verifySessions: Map<
          string,
          { code: string; verified: boolean; expiresAt: Date; attempts: number }
        >;
      };
      svc.verifySessions.set(email, {
        code,
        verified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
      });

      expect(() => service.checkVerificationCode(email, code)).not.toThrow();
    });

    it('해당 메일로 요청을 보내지 않았으면 ForbiddenException을 발생시켜야 한다', () => {
      expect(() =>
        service.checkVerificationCode('unknown@example.com', 'CODE'),
      ).toThrow(ForbiddenException);
      expect(() =>
        service.checkVerificationCode('unknown@example.com', 'CODE'),
      ).toThrow('해당 메일로 요청을 보내지 않았습니다.');
    });

    it('잘못된 코드면 BadRequestException을 발생시켜야 한다', () => {
      const email = 'check@example.com';
      const svc = service as unknown as {
        verifySessions: Map<
          string,
          { code: string; verified: boolean; expiresAt: Date; attempts: number }
        >;
      };
      svc.verifySessions.set(email, {
        code: 'RIGHT',
        verified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
      });

      expect(() => service.checkVerificationCode(email, 'WRONG')).toThrow(
        BadRequestException,
      );
      expect(() => service.checkVerificationCode(email, 'WRONG')).toThrow(
        '잘못 입력했습니다.',
      );
    });
  });

  describe('editUser', () => {
    it('수정할 정보가 없으면 BadRequestException을 발생시켜야 한다', async () => {
      const userId = 1;
      const dto = new EditUserRequestDto();

      await expect(service.editUser(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.editUser(userId, dto)).rejects.toThrow(
        '수정할 정보를 입력해주세요.',
      );
    });

    it('유저가 없으면 NotFoundException을 발생시켜야 한다', async () => {
      const userId = 999;
      const dto = { nickname: 'newnick' } as EditUserRequestDto;

      mockUserRepository.findOneById.mockResolvedValue(null);

      await expect(service.editUser(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.editUser(userId, dto)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });
  });
});
