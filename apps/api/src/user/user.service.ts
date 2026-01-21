import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';
import { UserRepository } from './user.repository';
import {
  hashPassword,
  isHashedPassword,
  verifyPassword,
} from './utils/password.util';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
