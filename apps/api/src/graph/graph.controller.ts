import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GraphService } from './graph.service';
import { GraphResponseDto } from './dtos/graph-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../auth/decorators/user-id.decorator';

@ApiTags('graph')
@Controller('graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

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
}
