/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { GraphService } from './graph.service';
import { GraphNode } from './entities/graph-node.entity';
import { GraphEdge } from './entities/graph-edge.entity';
import { NodeType } from './graph.constants';

const mockGraphNodeRepository = {
  find: jest.fn(),
};

const mockGraphEdgeRepository = {
  find: jest.fn(),
};

const mockTransactionFn = jest.fn();

const mockDataSource = {
  query: jest.fn(),
  transaction: mockTransactionFn,
};

describe('GraphService', () => {
  let service: GraphService;
  let graphNodeRepository: Repository<GraphNode>;
  let graphEdgeRepository: Repository<GraphEdge>;

  beforeEach(async () => {
    const loggerMock = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphService,
        {
          provide: getRepositoryToken(GraphNode),
          useValue: mockGraphNodeRepository,
        },
        {
          provide: getRepositoryToken(GraphEdge),
          useValue: mockGraphEdgeRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: Logger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<GraphService>(GraphService);
    graphNodeRepository = module.get<Repository<GraphNode>>(
      getRepositoryToken(GraphNode),
    );
    graphEdgeRepository = module.get<Repository<GraphEdge>>(
      getRepositoryToken(GraphEdge),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGraphByUserId', () => {
    it('userId로 노드와 엣지를 조회해 DTO 형태로 반환해야 한다', async () => {
      const userId = 1;
      const mockNodes = [
        {
          id: 1,
          type: NodeType.QUESTION,
          label: '질문1',
          questionId: 10,
        },
        {
          id: 2,
          type: NodeType.KEYWORD,
          label: '키워드',
          questionId: null,
        },
      ] as GraphNode[];
      const mockEdges = [{ id: 1, sourceId: 1, targetId: 2 }] as GraphEdge[];

      mockGraphNodeRepository.find.mockResolvedValue(mockNodes);
      mockGraphEdgeRepository.find.mockResolvedValue(mockEdges);

      const result = await service.getGraphByUserId(userId);

      expect(graphNodeRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(graphEdgeRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0]).toEqual({
        id: 1,
        type: NodeType.QUESTION,
        label: '질문1',
        questionId: 10,
      });
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual({ id: 1, sourceId: 1, targetId: 2 });
    });

    it('노드가 없으면 빈 그래프를 반환해야 한다', async () => {
      const userId = 999;
      mockGraphNodeRepository.find.mockResolvedValue([]);

      const result = await service.getGraphByUserId(userId);

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      expect(graphEdgeRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('createGraphFromEvaluation', () => {
    it('키워드가 없으면 트랜잭션을 실행하지 않고 조기 반환해야 한다', async () => {
      await service.createGraphFromEvaluation(1, 10, '제목', [], 100);

      expect(mockTransactionFn).not.toHaveBeenCalled();
    });

    it('키워드가 있으면 트랜잭션 내에서 노드/엣지를 생성해야 한다', async () => {
      const userId = 1;
      const questionId = 10;
      const questionTitle = '테스트 질문';
      const keywords = ['키워드1', '키워드2'];

      const mockManager = {
        findOne: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue(undefined),
        }),
        create: jest.fn(),
        save: jest.fn(),
      };

      const existingQuestionNode = {
        id: 100,
        userId,
        type: NodeType.QUESTION,
        label: questionTitle,
        questionId,
      } as GraphNode;

      mockManager.findOne
        .mockResolvedValueOnce(existingQuestionNode)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const createdKeywordNode1 = {
        id: 201,
        userId,
        type: NodeType.KEYWORD,
        label: '키워드1',
        questionId: null,
      } as GraphNode;
      const createdKeywordNode2 = {
        id: 202,
        userId,
        type: NodeType.KEYWORD,
        label: '키워드2',
        questionId: null,
      } as GraphNode;

      mockManager.create.mockImplementation(
        (_entity: unknown, data: Record<string, unknown>) =>
          ({ ...data, id: 201 }) as GraphNode,
      );
      mockManager.save
        .mockResolvedValueOnce(createdKeywordNode1)
        .mockResolvedValueOnce(createdKeywordNode2);

      mockTransactionFn.mockImplementation(
        async (fn: (manager: unknown) => Promise<void>) => {
          await fn(mockManager);
        },
      );

      await service.createGraphFromEvaluation(
        userId,
        questionId,
        questionTitle,
        keywords,
        100, // submissionId
      );

      expect(mockTransactionFn).toHaveBeenCalled();
    });
  });
});
