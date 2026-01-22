import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnswerSubmission } from 'src/answer-submission/entities/answer-submission.entity';
import { Question } from './entities/question.entity';
import { SolvedStatus } from './question.constants';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
  let service: QuestionService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockSubmissionQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockQuestionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockAnswerSubmissionRepository = {
    createQueryBuilder: jest.fn(() => mockSubmissionQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: getRepositoryToken(AnswerSubmission),
          useValue: mockAnswerSubmissionRepository,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByCategory', () => {
    it('카테고리 ID로 질문 목록을 조회한다', async () => {
      const mockQuestions = [
        { id: 1, title: '질문1', avgImportance: 5 },
        { id: 2, title: '질문2', avgImportance: 3 },
      ];
      mockQuestionRepository.find.mockResolvedValue(mockQuestions);

      const result = await service.findByCategory(1);

      expect(mockQuestionRepository.find).toHaveBeenCalledWith({
        where: { category: { id: 1 } },
        order: { avgImportance: 'DESC' },
      });
      expect(result).toEqual(mockQuestions);
    });

    it('카테고리에 질문이 없으면 빈 배열을 반환한다', async () => {
      mockQuestionRepository.find.mockResolvedValue([]);

      const result = await service.findByCategory(999);

      expect(result).toEqual([]);
    });
  });

  describe('findOneById', () => {
    it('질문 ID로 단일 질문을 조회한다', async () => {
      const mockQuestion = {
        id: 1,
        title: '테스트 질문',
        category: { id: 1, name: '카테고리' },
      };
      mockQuestionRepository.findOne.mockResolvedValue(mockQuestion);

      const result = await service.findOneById(1);

      expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['category', 'category.parent'],
      });
      expect(result).toEqual(mockQuestion);
    });

    it('존재하지 않는 질문 ID를 조회하면 null을 반환한다', async () => {
      mockQuestionRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneById(999);

      expect(result).toBeNull();
    });
  });

  describe('findPaginated', () => {
    const mockQuestionsWithCategory = [
      {
        id: 1,
        title: '질문1',
        category: {
          id: 5,
          name: 'React',
          depth: 2,
          parent: { id: 3, name: 'Frontend', depth: 1 },
        },
      },
      {
        id: 2,
        title: '질문2',
        category: {
          id: 5,
          name: 'React',
          depth: 2,
          parent: { id: 3, name: 'Frontend', depth: 1 },
        },
      },
    ];

    const setupMockReturn = (questions: unknown[], totalCount: number) => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        questions,
        totalCount,
      ]);
    };

    describe('기본값 및 반환 형태', () => {
      it('page 미지정 시 currentPage=1, pageSize=15로 반환한다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 30);

        const result = await service.findPaginated({});

        expect(result).toEqual({
          questions: mockQuestionsWithCategory.map((q) => ({
            ...q,
            score: null,
          })),
          totalCount: 30,
          pageSize: 15,
          currentPage: 1,
          totalPages: 2,
        });
      });

      it('반환된 질문에 category와 parentCategory 정보가 포함된다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 2);

        const result = await service.findPaginated({});

        expect(result.questions[0].category).toBeDefined();
        expect(result.questions[0].category.parent).toBeDefined();
        expect(result.questions[0].category.parent.name).toBe('Frontend');
      });
    });

    describe('skip 계산', () => {
      it.each([
        { page: 1, expectedSkip: 0 },
        { page: 2, expectedSkip: 15 },
        { page: 3, expectedSkip: 30 },
      ])(
        'page=$page일 때 skip=$expectedSkip',
        async ({ page, expectedSkip }) => {
          setupMockReturn(mockQuestionsWithCategory, 50);

          await service.findPaginated({ page });

          expect(mockQueryBuilder.skip).toHaveBeenCalledWith(expectedSkip);
        },
      );
    });

    describe('totalPages 계산', () => {
      it.each([
        { totalCount: 0, expectedTotalPages: 0 },
        { totalCount: 1, expectedTotalPages: 1 },
        { totalCount: 15, expectedTotalPages: 1 },
        { totalCount: 16, expectedTotalPages: 2 },
        { totalCount: 30, expectedTotalPages: 2 },
        { totalCount: 31, expectedTotalPages: 3 },
      ])(
        'totalCount=$totalCount일 때 totalPages=$expectedTotalPages',
        async ({ totalCount, expectedTotalPages }) => {
          setupMockReturn([], totalCount);

          const result = await service.findPaginated({});

          expect(result.totalPages).toBe(expectedTotalPages);
        },
      );
    });

    describe('필터 우선순위 및 적용', () => {
      it('categoryId만 있으면 조건이 1회 적용된다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 10);

        await service.findPaginated({ categoryId: 5 });

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(1);
      });

      it('parentCategoryId만 있으면 조건이 1회 적용된다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 10);

        await service.findPaginated({ parentCategoryId: 2 });

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(1);
      });

      it('categoryId와 parentCategoryId가 모두 있으면 조건이 1회만 적용된다 (categoryId 우선)', async () => {
        setupMockReturn(mockQuestionsWithCategory, 10);

        await service.findPaginated({ categoryId: 5, parentCategoryId: 2 });

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(1);
      });

      it('필터가 없으면 조건이 적용되지 않는다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 10);

        await service.findPaginated({});

        expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      });
    });

    describe('userId가 있을 때 score 매핑', () => {
      it('userId가 있으면 해당 사용자의 제출 점수를 조회하여 매핑한다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 2);
        mockSubmissionQueryBuilder.getRawMany.mockResolvedValue([
          { questionId: 1, maxScore: 85 },
        ]);

        const result = await service.findPaginated({}, 1);

        expect(
          mockAnswerSubmissionRepository.createQueryBuilder,
        ).toHaveBeenCalledWith('submission');
        expect(result.questions[0].score).toBe(85);
        expect(result.questions[1].score).toBeNull();
      });

      it('userId가 없으면 모든 질문의 score가 null이다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 2);

        const result = await service.findPaginated({});

        expect(
          mockAnswerSubmissionRepository.createQueryBuilder,
        ).not.toHaveBeenCalled();
        expect(result.questions.every((q) => q.score === null)).toBe(true);
      });

      it('질문 목록이 비어있으면 submission 쿼리를 실행하지 않는다', async () => {
        setupMockReturn([], 0);

        await service.findPaginated({}, 1);

        expect(
          mockAnswerSubmissionRepository.createQueryBuilder,
        ).not.toHaveBeenCalled();
      });
    });

    describe('solvedStatus 필터', () => {
      it('solvedStatus가 SOLVED이면 score가 있는 질문만 반환한다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 2);
        mockSubmissionQueryBuilder.getRawMany.mockResolvedValue([
          { questionId: 1, maxScore: 85 },
        ]);

        const result = await service.findPaginated(
          { solvedStatus: SolvedStatus.SOLVED },
          1,
        );

        expect(result.questions).toHaveLength(1);
        expect(result.questions[0].id).toBe(1);
        expect(result.questions[0].score).toBe(85);
      });

      it('solvedStatus가 UNSOLVED이면 score가 null인 질문만 반환한다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 2);
        mockSubmissionQueryBuilder.getRawMany.mockResolvedValue([
          { questionId: 1, maxScore: 85 },
        ]);

        const result = await service.findPaginated(
          { solvedStatus: SolvedStatus.UNSOLVED },
          1,
        );

        expect(result.questions).toHaveLength(1);
        expect(result.questions[0].id).toBe(2);
        expect(result.questions[0].score).toBeNull();
      });

      it('userId가 없으면 solvedStatus 필터가 적용되지 않는다', async () => {
        setupMockReturn(mockQuestionsWithCategory, 2);

        const result = await service.findPaginated({
          solvedStatus: SolvedStatus.SOLVED,
        });

        expect(result.questions).toHaveLength(2);
      });
    });
  });
});
