import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { UserId } from '../auth/decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckVerificationCodeRequestDto } from './dtos/request/check-verification-code.request.dto';
import { CreateUserRequestDto } from './dtos/request/create-user.request.dto';
import { EditUserRequestDto } from './dtos/request/edit-user.request.dto';
import { LoginRequestDto } from './dtos/request/login.request.dto';
import { RequestVerificationCodeRequestDto } from './dtos/request/request-verification-code.request.dto';
import { SolvedProblemsQueryDto } from './dtos/request/solved-problems-query.dto';
import { UserPresignedUrlRequestDto } from './dtos/request/user-presigned-url.request.dto';
import { LoginResponseDto } from './dtos/response/login.response.dto';
import { SolvedProblemsListResponseDto } from './dtos/response/solved-problems-list-response.dto';
import { UserPresignedUrlResponseDto } from './dtos/response/user-presigned-url.response.dto';
import { UserPublicResponseDto } from './dtos/response/user.public.response.dto';
import { UserService } from './user.service';

const USER_CONTROLLER_VALIDATION_PIPE = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

/** 쿼리 파라미터 검증용 (Swagger 등 외부 요청에서 추가 파라미터 허용) */
const QUERY_VALIDATION_PIPE = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: false,
});

@ApiTags('users')
@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('mail-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 코드 요청' })
  @ApiBody({ type: RequestVerificationCodeRequestDto })
  @ApiResponse({
    status: 200,
    description: '인증 코드 전송 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '인증 코드가 전송되었습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 사용 중인 이메일',
  })
  @ApiResponse({
    status: 500,
    description: '인증 메일 전송 실패',
  })
  @UsePipes(USER_CONTROLLER_VALIDATION_PIPE)
  async requestVerificationCode(
    @Body() dto: RequestVerificationCodeRequestDto,
  ): Promise<{ message: string }> {
    await this.userService.requestVerificationCode(dto.email);
    return { message: '인증 코드가 전송되었습니다.' };
  }

  @Post('verification-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 코드 확인' })
  @ApiBody({ type: CheckVerificationCodeRequestDto })
  @ApiResponse({
    status: 200,
    description: '인증 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '인증이 완료되었습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 인증 코드',
  })
  @ApiResponse({
    status: 403,
    description: '인증 요청이 없거나 만료되었거나 시도 횟수 초과',
  })
  @UsePipes(USER_CONTROLLER_VALIDATION_PIPE)
  checkVerificationCode(@Body() dto: CheckVerificationCodeRequestDto): {
    message: string;
  } {
    this.userService.checkVerificationCode(dto.email, dto.code);
    return { message: '인증이 완료되었습니다.' };
  }

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
      profileImage: user.profileImage ?? null,
      totalPoint: user.totalPoint ?? 0,
      totalScore: user.totalScore ?? 0,
      createdAt: user.createdAt.toISOString(),
    };
  }

  @Get('solved-problems')
  @ApiOperation({ summary: '내가 푼 문제 목록 조회' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
    description: '페이지 크기 (기본값: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '푼 문제 목록 조회 성공',
    type: SolvedProblemsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다',
  })
  @UsePipes(QUERY_VALIDATION_PIPE)
  async getSolvedProblems(
    @UserId() userId: number,
    @Query() query: SolvedProblemsQueryDto,
  ): Promise<SolvedProblemsListResponseDto> {
    return await this.userService.getSolvedProblems(
      userId,
      query.page ?? 1,
      query.size ?? 10,
    );
  }

  @Post('presigned-url')
  @ApiOperation({ summary: '프로필 이미지 업로드용 Presigned URL 요청' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UserPresignedUrlRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL 생성 성공',
    type: UserPresignedUrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '지원하지 않는 Content-Type',
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다',
  })
  @ApiResponse({
    status: 500,
    description: 'Presigned URL 생성 실패',
  })
  async requestPresignedUrl(
    @UserId() userId: number,
    @Body() dto: UserPresignedUrlRequestDto,
  ): Promise<UserPresignedUrlResponseDto> {
    return await this.userService.requestPresignedUrl(userId, dto.contentType);
  }

  @Patch('me')
  @ApiOperation({
    summary: '사용자 정보 수정 (닉네임, 프로필 이미지)',
    description: 'objectKey에 null을 보내면 프로필 이미지가 삭제됩니다.',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: EditUserRequestDto,
    examples: {
      updateNickname: {
        summary: '닉네임만 변경',
        value: { nickname: '새닉네임' },
      },
      updateImage: {
        summary: '프로필 이미지 변경',
        value: { objectKey: 'profile-images/uuid-here' },
      },
      deleteImage: {
        summary: '프로필 이미지 삭제',
        value: { objectKey: null },
      },
      updateBoth: {
        summary: '닉네임과 이미지 동시 변경',
        value: { nickname: '새닉네임', objectKey: 'profile-images/uuid-here' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 수정 성공',
    type: EditUserRequestDto,
  })
  @ApiResponse({
    status: 400,
    description:
      '잘못된 요청 (유효성 검증 실패, 유효하지 않은 objectKey, 수정할 정보 없음)',
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없습니다',
  })
  @ApiResponse({
    status: 409,
    description: '이미 사용 중인 닉네임입니다',
  })
  @ApiResponse({
    status: 500,
    description: '이미지 검증 실패',
  })
  @UsePipes(USER_CONTROLLER_VALIDATION_PIPE)
  async editUser(
    @UserId() userId: number,
    @Body() editUserRequestDto: EditUserRequestDto,
  ): Promise<UserPublicResponseDto> {
    const user = await this.userService.editUser(userId, editUserRequestDto);
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage || null,
      totalPoint: user.totalPoint ?? 0,
      totalScore: user.totalScore ?? 0,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
