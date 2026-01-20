import {
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import {
  GetConsecutiveDayCountResponseDto,
  GetYearlyActivityCountResponseDto,
} from './dtos/streaks-count.dto';
import { RecordDailyActivityResponseDto } from './dtos/streaks-reocrd.dto';
import { StreaksService } from './streaks.service';
import { AuthService } from '../auth/auth.service';

@ApiTags('streaks')
@Controller('streaks')
export class StreaksController {
  constructor(
    private readonly streaksService: StreaksService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: '연간 학습일 수 조회' })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: '조회할 연도 (기본값: 현재 연도)',
    example: 2024,
  })
  @ApiResponse({
    status: 200,
    description: '연간 학습일 수',
    type: GetYearlyActivityCountResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다',
  })
  async getYearlyActivityCount(
    @Req() req: Request,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ): Promise<GetYearlyActivityCountResponseDto> {
    const userId = await this.authService.getUserIdFromRequest(
      req.headers.authorization,
    );

    if (!year) {
      year = new Date().getFullYear();
    }
    return this.streaksService.getYearlyActivityCount(userId, year);
  }

  @Get('/sequence')
  @ApiOperation({ summary: '연속 학습일 수 조회' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: '연속 학습일 수',
    type: GetConsecutiveDayCountResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다',
  })
  async getConsecutiveDayCount(
    @Req() req: Request,
  ): Promise<GetConsecutiveDayCountResponseDto> {
    const userId = await this.authService.getUserIdFromRequest(
      req.headers.authorization,
    );

    return this.streaksService.getConsecutiveDayCount(userId);
  }

  @Post()
  @ApiOperation({ summary: '일일 학습 활동 기록' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: '학습 활동 기록 성공',
    type: RecordDailyActivityResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다',
  })
  async recordDailyActivity(
    @Req() req: Request,
  ): Promise<RecordDailyActivityResponseDto> {
    const userId = await this.authService.getUserIdFromRequest(
      req.headers.authorization,
    );
    return this.streaksService.recordDailyActivity(userId);
  }
}
