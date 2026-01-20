import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UserService } from './user.service';
import type { User } from './entities/user.entity';
import { LoginResponseDto } from './dtos/login.response.dto';
import { LoginRequestDto } from './dtos/login.request.dto';
import { AuthService } from '../auth/auth.service';

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

    // Access Token을 응답 본문에 포함 (BFF에서 쿠키로 저장)
    const response: LoginResponseDto = {
      accessToken,
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
  @ApiBearerAuth('JWT-auth')
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
    res.json({ message: '로그아웃 성공' });
  }

  @Get('me')
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiBearerAuth('JWT-auth')
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
    const userId = await this.authService.getUserIdFromRequest(
      req.headers.authorization,
    );

    return this.userService.getCurrentUser(userId);
  }
}
