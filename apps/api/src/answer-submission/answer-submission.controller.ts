import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Query,
  ParseIntPipe,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AnswerSubmissionService } from './answer-submission.service';
import { SubmitAnswerDto } from './dtos/submit-answer.dto';
import { AnswerSubmission } from './entities/answer-submission.entity';
import { AnswerSubmissionResponseDto } from './dtos/answer-submission-response.dto';
import { AuthService } from '../auth/auth.service';

@ApiTags('answer-submissions')
@Controller('answer-submissions')
export class AnswerSubmissionController {
  constructor(
    private readonly answerSubmissionService: AnswerSubmissionService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '질문 답변 제출',
    description:
      '오디오 에셋 ID와 질문 ID를 받아 답변을 제출합니다. 답변 제출 레코드를 생성하고 STT 처리를 요청합니다.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: '답변이 성공적으로 제출됨',
    type: AnswerSubmission,
  })
  @ApiBadRequestResponse({
    description:
      '오디오 에셋이 Object Storage에 업로드되지 않았거나 입력이 유효하지 않음',
  })
  @ApiNotFoundResponse({
    description: '오디오 에셋 또는 질문을 찾을 수 없음',
  })
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다',
  })
  async submitAnswer(
    @Req() req: Request,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ): Promise<AnswerSubmission> {
    try {
      const userId = await this.authService.getUserIdFromRequest(
        req.headers.authorization,
      );
      return await this.answerSubmissionService.submitAnswer(
        userId,
        submitAnswerDto,
      );
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : '로그인이 필요합니다.',
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: '문제별 제출 기록 조회',
    description: '특정 문제에 대한 사용자의 제출 기록을 최신순으로 조회합니다.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'questionId',
    type: 'number',
    required: true,
    description: '조회할 문제 ID',
    example: 1,
  })
  @ApiOkResponse({
    description: '조회 성공',
    type: [AnswerSubmissionResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: '로그인 필요',
  })
  async getDailySubmissionListByQuestionId(
    @Req() req: Request,
    @Query('questionId', ParseIntPipe) questionId: number,
  ) {
    try {
      const userId = await this.authService.getUserIdFromRequest(
        req.headers.authorization,
      );
      const result =
        await this.answerSubmissionService.getHistoryListByQuestionId(
          userId,
          questionId,
        );
      return result;
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : '로그인이 필요합니다.',
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: '제출 답안 상세 조회',
    description:
      '제출 ID(submissionId)를 통해 사용자가 작성한 답안 내용을 조회합니다.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: '조회할 제출 ID',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: AnswerSubmissionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '해당 ID의 제출 내역을 찾을 수 없습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다',
  })
  async getSubmissionById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      const userId = await this.authService.getUserIdFromRequest(
        req.headers.authorization,
      );
      return await this.answerSubmissionService.getSubmissionById(id, userId);
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : '로그인이 필요합니다.',
      );
    }
  }
}
