import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GraphService } from './graph.service';
import { GraphResponseDto } from './dtos/graph-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/user-id.decorator';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';

@ApiTags('graph')
@Controller('graph')
export class GraphController {
  constructor(
    private readonly graphService: GraphService,
    @InjectRepository(AnswerSubmission)
    private readonly answerSubmissionRepository: Repository<AnswerSubmission>,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '현재 사용자의 그래프 데이터 조회',
    description:
      '현재 로그인한 사용자가 학습한 문제와 키워드로 구성된 그래프 데이터를 조회합니다. 문제 노드, 키워드 노드, 그리고 노드 간 연결 관계를 포함합니다.',
  })
  @ApiOkResponse({
    description: '그래프 데이터 조회 성공',
    type: GraphResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '로그인이 필요합니다',
  })
  @ApiResponse({
    status: 200,
    description: '그래프 데이터가 없는 경우 빈 배열 반환',
    type: GraphResponseDto,
    example: {
      nodes: [],
      edges: [],
    },
  })
  async getGraph(@UserId() userId: number): Promise<GraphResponseDto> {
    return await this.graphService.getGraphByUserId(userId);
  }

  @Get('submission/:submissionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '제출별 추가된 그래프 조회',
    description:
      '해당 제출에서 추가된 그래프 노드·엣지만 조회합니다. 본인의 제출에만 접근 가능합니다.',
  })
  @ApiParam({ name: 'submissionId', description: '제출 ID' })
  @ApiOkResponse({
    description: '제출별 그래프 조회 성공',
    type: GraphResponseDto,
  })
  @ApiUnauthorizedResponse({ description: '로그인이 필요합니다' })
  @ApiResponse({
    status: 404,
    description: '제출을 찾을 수 없습니다',
  })
  @ApiResponse({
    status: 403,
    description: '본인의 제출이 아닙니다',
  })
  async getGraphBySubmissionId(
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @UserId() userId: number,
  ): Promise<GraphResponseDto> {
    const submission = await this.answerSubmissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('제출을 찾을 수 없습니다.');
    }

    if (submission.userId !== userId) {
      throw new ForbiddenException('본인의 제출만 조회할 수 있습니다.');
    }

    return await this.graphService.getGraphBySubmissionId(submissionId);
  }

  @Get('submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '여러 제출까지의 누적 그래프 조회',
    description:
      '지정한 제출 ID들에 해당하는 누적 그래프(그 시점까지 추가된 노드·엣지)를 조회합니다. 이전 제출을 볼 때 그 시점의 그래프 모양을 표시할 때 사용합니다. 본인의 제출에만 접근 가능합니다.',
  })
  @ApiQuery({
    name: 'ids',
    description: '제출 ID 목록 (쉼표 구분, 시간순)',
    example: '1,2,3',
  })
  @ApiOkResponse({
    description: '누적 그래프 조회 성공',
    type: GraphResponseDto,
  })
  @ApiUnauthorizedResponse({ description: '로그인이 필요합니다' })
  @ApiResponse({
    status: 400,
    description: 'ids 파라미터가 없거나 잘못됨',
  })
  @ApiResponse({
    status: 403,
    description: '본인의 제출이 아닌 ID가 포함됨',
  })
  async getGraphBySubmissionIds(
    @Query('ids') idsParam: string | undefined,
    @UserId() userId: number,
  ): Promise<GraphResponseDto> {
    if (!idsParam?.trim()) {
      throw new BadRequestException('ids 쿼리 파라미터가 필요합니다.');
    }

    const rawIds = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (rawIds.some((s) => !/^\d+$/.test(s))) {
      throw new BadRequestException(
        '유효하지 않은 제출 ID가 포함되어 있습니다.',
      );
    }
    const submissionIds = rawIds.map((s) => Number(s));
    const uniqueIds = Array.from(new Set(submissionIds));

    if (uniqueIds.length === 0) {
      throw new BadRequestException('유효한 제출 ID가 없습니다.');
    }
    if (uniqueIds.length !== submissionIds.length) {
      throw new BadRequestException('중복된 제출 ID가 포함되어 있습니다.');
    }

    const submissions = await this.answerSubmissionRepository.find({
      where: uniqueIds.map((id) => ({ id })),
    });

    if (submissions.length !== uniqueIds.length) {
      throw new NotFoundException('일부 제출을 찾을 수 없습니다.');
    }

    const allOwned = submissions.every((s) => s.userId === userId);
    if (!allOwned) {
      throw new ForbiddenException('본인의 제출만 조회할 수 있습니다.');
    }

    return await this.graphService.getGraphBySubmissionIds(uniqueIds);
  }
}
