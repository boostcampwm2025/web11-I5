import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

/**
 * Authorization 헤더의 Bearer 토큰을 검증하고,
 * 요청 객체(req)에 userId를 주입하는 Guard
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = await this.authService.getUserIdFromRequest(
      req.headers.authorization,
    );

    req.userId = userId;
    return true;
  }
}
