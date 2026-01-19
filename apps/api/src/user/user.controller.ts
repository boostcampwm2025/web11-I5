import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UserService } from './user.service';
import type { User } from './entities/user.entity';
import { LoginResponseDto } from './dtos/login.response.dto';
import { LoginRequestDto } from './dtos/login.request.dto';
import { AuthService } from '../auth/auth.service';

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7일
const ACCESS_TOKEN_MAX_AGE_MS = 1000 * 60 * 15; // 15분 (Access Token 만료 시간)

@ApiTags('users')
@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('test-users')
  @ApiOperation({ summary: '테스트 사용자 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '테스트 사용자 목록',
    type: [Object],
  })
  async getTestUsers(): Promise<User[]> {
    return this.userService.findAllTestUsers();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  async login(
    @Body() loginRequestDto: LoginRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.userService.login(
      loginRequestDto.nickname,
      loginRequestDto.password,
    );

    // Access Token 발급
    const accessToken = await this.authService.generateAccessToken(user);

    // Access Token을 HttpOnly Cookie로 설정
    res.cookie('accessToken', accessToken, {
      httpOnly: true, // JavaScript에서 접근 불가 (XSS 방지)
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송 (프로덕션)
      sameSite: 'strict', // CSRF 방지
      maxAge: ACCESS_TOKEN_MAX_AGE_MS, // 15분
    });

    // 기존 userId 쿠키는 하위 호환성을 위해 유지 (추후 제거 예정)
    res.cookie('userId', user.id.toString(), {
      httpOnly: false, // 프론트엔드에서도 접근 가능하도록
      maxAge: COOKIE_MAX_AGE_MS,
    });

    const response: LoginResponseDto = {
      user: {
        id: user.id,
        nickname: user.nickname,
      },
    };

    res.json(response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃' })
  @ApiCookieAuth('userId')
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '로그아웃 성공' },
      },
    },
  })
  logout(@Res() res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('userId');
    res.json({ message: '로그아웃 성공' });
  }

  @Get('me')
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiCookieAuth('userId')
  @ApiResponse({
    status: 200,
    description: '현재 사용자 정보',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다',
  })
  async getCurrentUser(@Req() req: Request): Promise<User> {
    const userId = Number(req.cookies?.userId);
    if (!userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    return this.userService.getCurrentUser(userId);
  }
}
