import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UserService } from './user.service';
import { LoginResponseDto } from './dtos/response/login.response.dto';
import { LoginRequestDto } from './dtos/request/login.request.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/user-id.decorator';
import { CreateUserRequestDto } from './dtos/request/create-user.request.dto';
import { UserPublicResponseDto } from './dtos/response/user.public.response.dto';

const USER_CONTROLLER_VALIDATION_PIPE = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

@ApiTags('users')
@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: CreateUserRequestDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'test@example.com' },
        nickname: { type: 'string', example: 'user123' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청(유효성 검증 실패)',
  })
  @UsePipes(USER_CONTROLLER_VALIDATION_PIPE)
  async createUser(@Body() dto: CreateUserRequestDto): Promise<{
    id: number;
    email: string;
    nickname: string;
  }> {
    const user = await this.userService.createUser(dto);
    // 회원가입 시 email은 DTO로 필수 입력이므로 null이 될 수 없음
    return { id: user.id, email: user.email, nickname: user.nickname };
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
    status: 400,
    description: '잘못된 요청(유효성 검증 실패)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @UsePipes(USER_CONTROLLER_VALIDATION_PIPE)
  async login(
    @Body() loginRequestDto: LoginRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.userService.login(
      loginRequestDto.email,
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: '현재 사용자 정보',
    type: UserPublicResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다',
  })
  async getCurrentUser(
    @UserId() userId: number,
  ): Promise<UserPublicResponseDto> {
    const user = await this.userService.getCurrentUser(userId);
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      totalPoint: user.totalPoint ?? 0,
      totalScore: user.totalScore ?? 0,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
