import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ParseIntPipe,
  Param,
  Patch,
  UseGuards,
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
  ApiBody,
} from '@nestjs/swagger';
import { AnswerSubmissionService } from './answer-submission.service';
import { SubmitAnswerDto } from './dtos/submit-answer.dto';
import { AnswerSubmission } from './entities/answer-submission.entity';
import { AnswerSubmissionResponseDto } from './dtos/answer-submission-response.dto';
import { UpdateImportanceDto } from './dtos/update-importance-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/user-id.decorator';

@ApiTags('answer-submissions')
@Controller('answer-submissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnswerSubmissionController {
  constructor(
    private readonly answerSubmissionService: AnswerSubmissionService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '질문 답변 제출',
    description:
      '오디오 에셋 ID와 질문 ID를 받아 답변을 제출합니다. 답변 제출 레코드를 생성하고 STT 처리를 요청합니다.',
  })
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
    @UserId() userId: number,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ): Promise<AnswerSubmission> {
    return await this.answerSubmissionService.submitAnswer(
      userId,
      submitAnswerDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: '문제별 제출 기록 조회',
    description: '특정 문제에 대한 사용자의 제출 기록을 최신순으로 조회합니다.',
  })
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
    @UserId() userId: number,
    @Query('questionId', ParseIntPipe) questionId: number,
  ) {
    return await this.answerSubmissionService.getHistoryListByQuestionId(
      userId,
      questionId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '제출 답안 상세 조회',
    description:
      '제출 ID(submissionId)를 통해 사용자가 작성한 답안 내용을 조회합니다.',
  })
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
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.answerSubmissionService.getSubmissionById(id, userId);
  }

  @Patch('importance')
  @ApiOperation({
    summary: '중요도 평가 업데이트',
    description:
      '방금 제출한 답변에 대해 사용자가 입력한 중요도(별점)를 업데이트합니다.',
  })
  @ApiBody({ type: UpdateImportanceDto })
  @ApiResponse({ status: 200, description: '업데이트 성공' })
  async updateImportance(
    @UserId() userId: number,
    @Body() updateDto: UpdateImportanceDto,
  ) {
    // TODO: 실제 프로젝트의 인증 방식에 맞춰 userId를 가져오세요.

    return await this.answerSubmissionService.updateImportance(
      userId,
      updateDto,
    );
  }
}
