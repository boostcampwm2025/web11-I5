import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly TEST_USER_PASSWORD = 'test123';

  constructor(private readonly userRepository: UserRepository) {}

  async ensureTestUser(): Promise<void> {
    const testUserNickname = '테스트 유저';
    const existingUser =
      await this.userRepository.findOneByNickname(testUserNickname);

    if (!existingUser) {
      await this.userRepository.create({
        nickname: testUserNickname,
        password: this.TEST_USER_PASSWORD,
        totalPoint: 0,
        totalScore: 0,
        role: UserRole.USER,
      });
    } else if (!existingUser.password) {
      // 기존 유저에 비밀번호가 없으면 업데이트
      existingUser.password = this.TEST_USER_PASSWORD;
      await this.userRepository.save(existingUser);
    }
  }

  async findAllTestUsers(): Promise<User[]> {
    // 테스트 유저 하나만 반환
    const testUser = await this.userRepository.findOneByNickname('테스트 유저');
    return testUser ? [testUser] : [];
  }

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOneById(id);
  }

  // 닉네임 + 비밀번호 기반 로그인
  async login(nickname: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneByNickname(nickname);

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (user.password !== password) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
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
