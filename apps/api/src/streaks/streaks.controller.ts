import {
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserId } from '../auth/decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GetConsecutiveDayCountResponseDto,
  GetYearlyActivityCountResponseDto,
} from './dtos/streaks-count.dto';
import { RecordDailyActivityResponseDto } from './dtos/streaks-record.dto';
import { StreaksService } from './streaks.service';

@ApiTags('streaks')
@Controller('streaks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  @Get()
  @ApiOperation({ summary: '연간 학습일 수 조회' })
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
    @UserId() userId: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ): Promise<GetYearlyActivityCountResponseDto> {
    if (!year) {
      year = new Date().getFullYear();
    }
    return this.streaksService.getYearlyActivityCount(userId, year);
  }

  @Get('/consecutive')
  @ApiOperation({ summary: '연속 학습일 수 조회' })
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
    @UserId() userId: number,
  ): Promise<GetConsecutiveDayCountResponseDto> {
    return this.streaksService.getConsecutiveDayCount(userId);
  }

  @Post()
  @ApiOperation({ summary: '일일 학습 활동 기록' })
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
    @UserId() userId: number,
  ): Promise<RecordDailyActivityResponseDto> {
    return this.streaksService.recordDailyActivity(userId);
  }
}
