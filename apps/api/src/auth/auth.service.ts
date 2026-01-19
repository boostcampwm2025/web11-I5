import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/entities/user-role.enum';

export interface JwtPayload {
  sub: number; // 사용자 ID
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Access Token 발급
   * @param user 사용자 엔티티
   * @returns Access Token 문자열
   */
  async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    // Access Token 만료 시간: 15분
    const ACCESS_TOKEN_EXPIRES_IN = '15m';

    return this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }
}
