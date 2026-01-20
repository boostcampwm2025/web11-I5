import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GraphNode } from './entities/graph-node.entity';
import { GraphEdge } from './entities/graph-edge.entity';
import {
  GraphResponseDto,
  GraphNodeDto,
  GraphEdgeDto,
} from './dtos/graph-response.dto';
import { DataSource } from 'typeorm';
import { NodeType } from './graph.constants';

@Injectable()
export class GraphService {
  constructor(
    @InjectRepository(GraphNode)
    private graphNodeRepository: Repository<GraphNode>,
    @InjectRepository(GraphEdge)
    private graphEdgeRepository: Repository<GraphEdge>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * 특정 유저가 학습한 그래프 데이터를 조회한다
   *
   * 조회 로직:
   * 1. answer_submissions에서 userId로 question_id 목록 조회
   * 2. 해당 question_id에 연결된 GraphNode (QUESTION 타입) 조회
   * 3. 해당 노드들과 연결된 GraphEdge 조회
   * 4. 엣지의 sourceId, targetId를 통해 연결된 모든 노드 조회 (KEYWORD 포함)
   * 5. nodes와 edges를 반환
   *
   * @param userId - 조회할 유저 ID
   * @returns 그래프 데이터 (nodes, edges)
   */
  async getGraphByUserId(userId: number): Promise<GraphResponseDto> {
    // 1. userId로 학습한 question_id 목록 조회
    const questionIds = await this.getQuestionIdsByUserId(userId);

    // 학습한 문제가 없으면 빈 그래프 반환
    if (questionIds.length === 0) {
      return {
        nodes: [],
        edges: [],
      };
    }

    // 2. 해당 question_id에 연결된 QUESTION 노드 조회
    const questionNodes = await this.graphNodeRepository.find({
      where: {
        type: NodeType.QUESTION,
        questionId: In(questionIds),
      },
    });

    // QUESTION 노드가 없으면 빈 그래프 반환
    if (questionNodes.length === 0) {
      return {
        nodes: [],
        edges: [],
      };
    }

    const questionNodeIds = questionNodes.map((node) => node.id);

    // 3. 해당 노드들과 연결된 엣지 조회 (sourceId 또는 targetId가 questionNodeIds에 포함)
    const edges = await this.graphEdgeRepository
      .createQueryBuilder('edge')
      .where('edge.sourceId IN (:...nodeIds)', { nodeIds: questionNodeIds })
      .orWhere('edge.targetId IN (:...nodeIds)', { nodeIds: questionNodeIds })
      .getMany();

    // 4. 엣지에 연결된 모든 노드 ID 수집 (QUESTION + KEYWORD)
    const connectedNodeIds = new Set<number>();
    questionNodeIds.forEach((id) => connectedNodeIds.add(id));
    edges.forEach((edge) => {
      connectedNodeIds.add(edge.sourceId);
      connectedNodeIds.add(edge.targetId);
    });

    // 5. 연결된 모든 노드 조회 (QUESTION + KEYWORD)
    const allNodes = await this.graphNodeRepository.find({
      where: {
        id: In(Array.from(connectedNodeIds)),
      },
    });

    // 6. DTO 형태로 변환
    const nodeDtos: GraphNodeDto[] = allNodes.map((node) => ({
      id: node.id,
      type: node.type,
      label: node.label,
      questionId: node.questionId,
    }));

    const edgeDtos: GraphEdgeDto[] = edges.map((edge) => ({
      id: edge.id,
      sourceId: edge.sourceId,
      targetId: edge.targetId,
    }));

    return {
      nodes: nodeDtos,
      edges: edgeDtos,
    };
  }

  /**
   * userId로 학습한 question_id 목록을 조회한다
   * @param userId - 유저 ID
   * @returns question_id 배열
   */
  private async getQuestionIdsByUserId(userId: number): Promise<number[]> {
    interface QuestionIdRow {
      question_id: number;
    }

    const result: QuestionIdRow[] = await this.dataSource.query(
      `SELECT DISTINCT question_id 
       FROM answer_submissions 
       WHERE user_id = $1`,
      [userId],
    );

    return result.map((row: QuestionIdRow): number => row.question_id);
  }
}
