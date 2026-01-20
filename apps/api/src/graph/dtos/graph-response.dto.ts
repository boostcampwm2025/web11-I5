import { ApiProperty } from '@nestjs/swagger';
import { NodeType } from '../graph.constants';

/**
 * 그래프 노드 응답 DTO
 */
export class GraphNodeDto {
  @ApiProperty({
    description: '노드 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '노드 타입 (QUESTION 또는 KEYWORD)',
    enum: NodeType,
    example: NodeType.QUESTION,
  })
  type: NodeType;

  @ApiProperty({
    description: '노드 라벨 (표시용 텍스트)',
    example: 'React란 무엇인가요?',
  })
  label: string;

  @ApiProperty({
    description: '질문 ID (QUESTION 타입일 때만 존재, KEYWORD 타입은 null)',
    example: 1,
    nullable: true,
  })
  questionId: number | null;
}

/**
 * 그래프 엣지 응답 DTO
 */
export class GraphEdgeDto {
  @ApiProperty({
    description: '엣지 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '출발 노드 ID',
    example: 1,
  })
  sourceId: number;

  @ApiProperty({
    description: '도착 노드 ID',
    example: 2,
  })
  targetId: number;
}

/**
 * 그래프 데이터 응답 DTO
 */
export class GraphResponseDto {
  @ApiProperty({
    description: '그래프 노드 목록',
    type: [GraphNodeDto],
    example: [
      {
        id: 1,
        type: 'QUESTION',
        label: 'React란 무엇인가요?',
        questionId: 1,
      },
      {
        id: 2,
        type: 'KEYWORD',
        label: 'React',
        questionId: null,
      },
    ],
  })
  nodes: GraphNodeDto[];

  @ApiProperty({
    description: '그래프 엣지 목록',
    type: [GraphEdgeDto],
    example: [
      {
        id: 1,
        sourceId: 1,
        targetId: 2,
      },
    ],
  })
  edges: GraphEdgeDto[];
}
