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

  /**
   * Access Token 검증 및 페이로드 추출
   * @param token Access Token 문자열
   * @returns JWT 페이로드
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch {
      throw new Error('유효하지 않은 토큰입니다.');
    }
  }

  /**
   * Request에서 Bearer 토큰을 추출하고 검증하여 사용자 ID 반환
   * @param authHeader Authorization 헤더 값
   * @returns 사용자 ID
   * @throws UnauthorizedException 토큰이 없거나 유효하지 않은 경우
   */
  async getUserIdFromRequest(authHeader: string | undefined): Promise<number> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거

    try {
      const payload = await this.verifyAccessToken(token);
      return payload.sub;
    } catch {
      throw new Error('유효하지 않은 토큰입니다.');
    }
  }
}
