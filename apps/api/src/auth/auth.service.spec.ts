import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/entities/user-role.enum';

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('유저 정보로 Access Token을 발급해야 한다', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        nickname: 'tester',
        role: UserRole.USER,
      } as User;
      const expectedToken = 'jwt.token.here';

      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.generateAccessToken(user);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        role: user.role,
      });
      expect(result).toBe(expectedToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('유효한 토큰이면 페이로드를 반환해야 한다', async () => {
      const token = 'valid.jwt.token';
      const payload: JwtPayload = { sub: 1, role: UserRole.USER };

      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.verifyAccessToken(token);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(result).toEqual(payload);
    });

    it('유효하지 않은 토큰이면 UnauthorizedException을 발생시켜야 한다', async () => {
      const token = 'invalid.jwt.token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(service.verifyAccessToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyAccessToken(token)).rejects.toThrow(
        '유효하지 않은 토큰입니다.',
      );
    });
  });

  describe('getUserIdFromRequest', () => {
    it('Bearer 토큰이 있으면 검증 후 사용자 ID를 반환해야 한다', async () => {
      const authHeader = 'Bearer valid.jwt.token';
      const payload: JwtPayload = { sub: 42, role: UserRole.USER };

      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.getUserIdFromRequest(authHeader);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid.jwt.token',
      );
      expect(result).toBe(42);
    });

    it('Authorization 헤더가 없으면 UnauthorizedException을 발생시켜야 한다', async () => {
      await expect(service.getUserIdFromRequest(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.getUserIdFromRequest(undefined)).rejects.toThrow(
        '로그인이 필요합니다.',
      );
    });

    it('Bearer 접두사가 없으면 UnauthorizedException을 발생시켜야 한다', async () => {
      await expect(service.getUserIdFromRequest('Basic xxx')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.getUserIdFromRequest('Basic xxx')).rejects.toThrow(
        '로그인이 필요합니다.',
      );
    });
  });
});
