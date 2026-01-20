import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard';

/**
 * Guard에서 주입한 userId를 꺼내오는 파라미터 데코레이터
 *
 * 사용 예:
 * - handler(@UserId() userId: number) { ... }
 */
export const UserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.userId;

    if (typeof userId !== 'number') {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return userId;
  },
);
