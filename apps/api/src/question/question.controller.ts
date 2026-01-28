import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FindOneParams } from './dtos/find-one-params.dto';
import { PaginatedOtherSubmissionsDto } from './dtos/paginated-other-submissions.dto';
import { OtherSubmissionDetailDto } from './dtos/other-submission-detail.dto';
import { PaginatedQuestionsDto } from './dtos/paginated-questions.dto';
import { QuestionFilterDto } from './dtos/question-filter.dto';
import { Question } from './entities/question.entity';
import { QuestionService } from './question.service';

@ApiTags('questions')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @ApiOperation({
    summary: '질문 목록 조회',
    description:
      '페이지네이션과 카테고리 필터를 적용하여 질문 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: '중분류 카테고리 ID',
  })
  @ApiQuery({
    name: 'parentCategoryId',
    required: false,
    type: Number,
    description: '대분류 카테고리 ID',
  })
  @ApiResponse({
    status: 200,
    description: '질문 목록 조회 성공',
    type: PaginatedQuestionsDto,
  })
  async getPaginated(
    @Query() filter: QuestionFilterDto,
  ): Promise<PaginatedQuestionsDto> {
    return await this.questionService.findPaginated(filter);
  }

  @Get('/auth')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '질문 목록 조회',
    description:
      '페이지네이션과 카테고리 필터를 적용하여 질문 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: '중분류 카테고리 ID',
  })
  @ApiQuery({
    name: 'parentCategoryId',
    required: false,
    type: Number,
    description: '대분류 카테고리 ID',
  })
  @ApiQuery({
    name: 'solvedStatus',
    required: false,
    type: 'string',
    description: 'SOLVED / UNSOLVED',
  })
  @ApiResponse({
    status: 200,
    description: '질문 목록 조회 성공',
    type: PaginatedQuestionsDto,
  })
  @UseGuards(JwtAuthGuard)
  async getPaginatedWithAuth(
    @Query() filter: QuestionFilterDto,
    @UserId() userId: number,
  ): Promise<PaginatedQuestionsDto> {
    return await this.questionService.findPaginated(filter, userId);
  }

  @Get('category/:categoryId')
  async getBySubCategory(@Param('categoryId') categoryId: string) {
    return await this.questionService.findByCategory(+categoryId);
  }

  @Get(':questionId/others/:submissionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '타 유저 제출 상세 조회',
    description:
      '특정 문제에 대한 다른 사용자의 제출(답변) 상세 정보와 AI 평가 결과(피드백, 점수, 핵심 키워드 등)를 조회합니다.',
  })
  @ApiParam({
    name: 'questionId',
    description: '문제 ID',
    type: Number,
    example: 1,
  })
  @ApiParam({
    name: 'submissionId',
    description: '조회할 제출 ID',
    type: Number,
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: '타 유저 제출 상세 조회 성공',
    type: OtherSubmissionDetailDto,
  })
  @ApiNotFoundResponse({
    description: '문제 또는 제출 내역을 찾을 수 없습니다',
  })
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다',
  })
  async getOtherSubmissionDetail(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @UserId() userId: number,
  ): Promise<OtherSubmissionDetailDto> {
    return await this.questionService.findOtherSubmissionDetail(
      questionId,
      submissionId,
      userId,
    );
  }

  @Get(':questionId/others')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '특정 문제에 대한 타 유저 제출 리스트 조회',
    description:
      '특정 문제에 대해 본인을 제외한 다른 사용자들의 제출 이력을 조회합니다. 각 제출물에 대해 제출한 사용자, 점수, 제출 시각을 제공합니다.',
  })
  @ApiParam({
    name: 'questionId',
    description: '조회할 문제 ID',
    type: Number,
    example: 1,
  })
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
    description: '타 유저 제출 리스트 조회 성공',
    type: PaginatedOtherSubmissionsDto,
  })
  @ApiNotFoundResponse({
    description: '문제를 찾을 수 없습니다',
  })
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다',
  })
  async getOtherSubmissions(
    @Param('questionId', ParseIntPipe) questionId: number,
    @UserId() userId: number,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ): Promise<PaginatedOtherSubmissionsDto> {
    return await this.questionService.findOtherSubmissions(
      questionId,
      userId,
      page ?? 1,
      size ?? 10,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get question by ID',
    description: 'Retrieve a single question by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Question ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Question found successfully',
    type: Question,
  })
  @ApiNotFoundResponse({
    description: 'Question not found',
  })
  @UseGuards(JwtAuthGuard)
  async getById(@Param() params: FindOneParams) {
    const question = await this.questionService.findOneById(+params.id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${params.id} not found`);
    }
    return question;
  }
}
