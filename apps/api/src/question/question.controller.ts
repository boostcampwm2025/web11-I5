import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { FindOneParams } from './dtos/find-one-params.dto';
import { QuestionFilterDto } from './dtos/question-filter.dto';
import { PaginatedQuestionsDto } from './dtos/paginated-questions.dto';
import { Question } from './entities/question.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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

  @Get('category/:categoryId')
  async getBySubCategory(@Param('categoryId') categoryId: string) {
    return await this.questionService.findByCategory(+categoryId);
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
