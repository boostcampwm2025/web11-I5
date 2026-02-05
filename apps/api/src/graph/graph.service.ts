import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
  private readonly logger = new Logger(GraphService.name);

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
   * 1. 해당 userId의 모든 GraphNode 조회 (QUESTION + KEYWORD)
   * 2. 해당 userId의 모든 GraphEdge 조회
   * 3. nodes와 edges를 반환
   *
   * @param userId - 조회할 유저 ID
   * @returns 그래프 데이터 (nodes, edges)
   */
  async getGraphByUserId(userId: number): Promise<GraphResponseDto> {
    // 1. 해당 사용자의 모든 노드 조회 (QUESTION + KEYWORD)
    const allNodes = await this.graphNodeRepository.find({
      where: {
        userId: userId,
      },
    });

    // 노드가 없으면 빈 그래프 반환
    if (allNodes.length === 0) {
      return {
        nodes: [],
        edges: [],
      };
    }

    // 2. 해당 사용자의 모든 엣지 조회
    const edges = await this.graphEdgeRepository.find({
      where: {
        userId: userId,
      },
    });

    // 3. DTO 형태로 변환
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
   * 특정 제출에서 추가된 그래프(노드·엣지)만 조회한다.
   * 해당 제출 시 생성된 엣지와 그 엣지의 양 끝 노드를 반환한다.
   *
   * @param submissionId - 제출 ID
   * @returns 해당 제출에서 추가된 서브그래프 (nodes, edges)
   */
  async getGraphBySubmissionId(
    submissionId: number,
  ): Promise<GraphResponseDto> {
    const edges = await this.graphEdgeRepository.find({
      where: { submissionId },
    });

    if (edges.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodeIds = new Set<number>();
    for (const edge of edges) {
      nodeIds.add(edge.sourceId);
      nodeIds.add(edge.targetId);
    }

    const nodes = await this.graphNodeRepository.find({
      where: { id: In(Array.from(nodeIds)) },
    });

    const nodeDtos: GraphNodeDto[] = nodes.map((node) => ({
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
   * 여러 제출 ID에 해당하는 누적 그래프를 조회한다.
   * 해당 제출들에서 추가된 모든 엣지와 그 엣지의 양 끝 노드를 반환한다.
   * (이전 제출을 볼 때 "그 시점까지의 그래프 모양" 표시용)
   *
   * @param submissionIds - 제출 ID 배열 (시간순으로 정렬된 것이어야 함)
   * @returns 누적 서브그래프 (nodes, edges)
   */
  async getGraphBySubmissionIds(
    submissionIds: number[],
  ): Promise<GraphResponseDto> {
    if (!submissionIds?.length) {
      return { nodes: [], edges: [] };
    }

    const edges = await this.graphEdgeRepository.find({
      where: { submissionId: In(submissionIds) },
    });

    if (edges.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodeIds = new Set<number>();
    for (const edge of edges) {
      nodeIds.add(edge.sourceId);
      nodeIds.add(edge.targetId);
    }

    const nodes = await this.graphNodeRepository.find({
      where: { id: In(Array.from(nodeIds)) },
    });

    const nodeDtos: GraphNodeDto[] = nodes.map((node) => ({
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

  /**
   * AI 평가 결과로부터 그래프 데이터를 생성한다
   *
   * 로직:
   * 1. 문제 노드 생성 또는 재사용 (userId, questionId로 기존 노드 확인)
   * 2. 각 키워드에 대해 키워드 노드 생성 또는 재사용 (userId, label로 유니크 제약 활용)
   * 3. 문제-키워드 간 엣지 생성 (중복 방지, submissionId 기록)
   *
   * @param userId - 사용자 ID
   * @param questionId - 문제 ID
   * @param questionTitle - 문제 제목
   * @param keywords - 추출된 키워드 배열
   * @param submissionId - 이 평가에 해당하는 제출 ID (제출별 그래프 조회용)
   */
  async createGraphFromEvaluation(
    userId: number,
    questionId: number,
    questionTitle: string,
    keywords: string[],
    submissionId: number,
  ): Promise<void> {
    // 키워드가 없으면 그래프 생성하지 않음
    if (!keywords || keywords.length === 0) {
      this.logger.debug(
        `userId: ${userId}, questionId: ${questionId}에 대해 생성할 키워드가 존재하지 않습니다.`,
      );
      return;
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        // 1. 문제 노드 생성 또는 재사용 (사용자별로 독립적)
        let questionNode = await manager.findOne(GraphNode, {
          where: {
            userId: userId,
            type: NodeType.QUESTION,
            questionId: questionId,
          },
        });

        if (!questionNode) {
          await manager
            .createQueryBuilder()
            .insert()
            .into(GraphNode)
            .values({
              userId: userId,
              type: NodeType.QUESTION,
              label: questionTitle,
              questionId: questionId,
            })
            .orIgnore()
            .execute();

          questionNode = await manager.findOne(GraphNode, {
            where: {
              userId: userId,
              type: NodeType.QUESTION,
              questionId: questionId,
            },
          });
          if (!questionNode) {
            throw new Error('문제 노드 생성에 실패했습니다.');
          }
        }

        // 2. 각 키워드에 대해 키워드 노드 생성 또는 재사용 (사용자별로 독립적)
        const keywordNodes: GraphNode[] = [];
        const normalizedKeywords = Array.from(
          new Set(
            keywords
              .filter((k): k is string => typeof k === 'string' && k.length > 0)
              .map((k) => k.trim()),
          ),
        );

        for (const trimmedKeyword of normalizedKeywords) {
          // 사용자별 유니크 제약을 활용하여 기존 노드 확인
          let keywordNode = await manager.findOne(GraphNode, {
            where: {
              userId: userId,
              type: NodeType.KEYWORD,
              label: trimmedKeyword,
            },
          });

          if (!keywordNode) {
            keywordNode = manager.create(GraphNode, {
              userId: userId,
              type: NodeType.KEYWORD,
              label: trimmedKeyword,
              questionId: null,
            });
            keywordNode = await manager.save(GraphNode, keywordNode);
          }

          keywordNodes.push(keywordNode);
        }

        // 3. 문제-키워드 간 엣지 생성 (중복 방지, 사용자별로 독립적)
        for (const keywordNode of keywordNodes) {
          // sourceId와 targetId의 순서를 일관되게 유지 (sourceId < targetId)
          const sourceId = Math.min(questionNode.id, keywordNode.id);
          const targetId = Math.max(questionNode.id, keywordNode.id);

          // 이미 존재하는 엣지인지 확인 (사용자별로)
          const existingEdge = await manager.findOne(GraphEdge, {
            where: {
              userId: userId,
              sourceId: sourceId,
              targetId: targetId,
            },
          });

          if (!existingEdge) {
            const edge = manager.create(GraphEdge, {
              userId: userId,
              sourceId: sourceId,
              targetId: targetId,
              submissionId: submissionId,
            });
            await manager.save(GraphEdge, edge);
          }
        }
      });
    } catch (error) {
      this.logger.error(
        `userId: ${userId}, questionId: ${questionId}에 대한 그래프 데이터 생성에 실패했습니다.`,
        error,
      );
      // 그래프 생성 실패는 평가 프로세스를 중단하지 않도록 에러를 throw하지 않음
    }
  }
}
