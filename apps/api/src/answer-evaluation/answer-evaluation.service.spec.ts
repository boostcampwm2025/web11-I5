import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { AnswerEvaluationService } from './answer-evaluation.service';
import { LlmService } from '../llm/llm.service';
import {
  AccuracyEval,
  LogicEval,
  DepthEval,
  EvaluationStatus,
} from './answer-evaluation.constants';
import { AnswerEvaluation } from './entities/answer-evaluation.entity';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';
import { Question } from '../question/entities/question.entity';
import { QuestionSolution } from '../question-solution/entities/question-solution.entity';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

const mockRepoFactory = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('AnswerEvaluationService', () => {
  let service: AnswerEvaluationService;
  let answerEvaluationRepository: ReturnType<typeof mockRepoFactory>;
  let answerSubmissionRepository: ReturnType<typeof mockRepoFactory>;
  let questionRepository: ReturnType<typeof mockRepoFactory>;
  let questionSolutionRepository: ReturnType<typeof mockRepoFactory>;
  let llmService: { callWithSchema: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  const mockLlmService = {
    callWithSchema: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('gemini-2.5-flash-lite-preview-09-2025'),
  };

  const mockEntityManager = {
    update: jest.fn(),
    save: jest.fn(),
  } as unknown as EntityManager;

  beforeEach(async () => {
    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation(
          async (cb: (manager: Partial<EntityManager>) => Promise<unknown>) => {
            return await cb(mockEntityManager);
          },
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerEvaluationService,
        {
          provide: LlmService,
          useValue: mockLlmService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(AnswerEvaluation),
          useValue: mockRepoFactory(),
        },
        {
          provide: getRepositoryToken(AnswerSubmission),
          useValue: mockRepoFactory(),
        },
        {
          provide: getRepositoryToken(Question),
          useValue: mockRepoFactory(),
        },
        {
          provide: getRepositoryToken(QuestionSolution),
          useValue: mockRepoFactory(),
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    })
      .setLogger({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
        fatal: jest.fn(),
        setLogLevels: jest.fn(),
      })
      .compile();

    service = module.get<AnswerEvaluationService>(AnswerEvaluationService);
    answerEvaluationRepository = module.get(
      getRepositoryToken(AnswerEvaluation),
    );
    answerSubmissionRepository = module.get(
      getRepositoryToken(AnswerSubmission),
    );
    questionRepository = module.get(getRepositoryToken(Question));
    questionSolutionRepository = module.get(
      getRepositoryToken(QuestionSolution),
    );
    llmService = module.get(LlmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluate', () => {
    it('답안을 찾지 못하면 NotFoundException을 던져야 한다', async () => {
      answerSubmissionRepository.findOne.mockResolvedValue(null);
      await expect(service.evaluate(1)).rejects.toThrow(NotFoundException);
    });

    it('답안 내용이 없으면 BadRequestException을 던져야 한다', async () => {
      answerSubmissionRepository.findOne.mockResolvedValue({
        id: 1,
        rawAnswer: '',
        evaluationStatus: EvaluationStatus.PENDING,
      });
      await expect(service.evaluate(1)).rejects.toThrow(BadRequestException);
    });

    it('이미 완료된 답안이면 ConflictException을 던져야 한다', async () => {
      answerSubmissionRepository.findOne.mockResolvedValue({
        id: 1,
        rawAnswer: 'Some answer',
        evaluationStatus: EvaluationStatus.COMPLETED,
      });
      await expect(service.evaluate(1)).rejects.toThrow(ConflictException);
    });

    it('정상적인 경우 초기 평가 엔티티를 생성하고 ID를 반환해야 한다', async () => {
      const mockSubmission = {
        id: 1,
        rawAnswer: 'Some answer',
        evaluationStatus: EvaluationStatus.PENDING,
        questionId: 10,
      };
      const mockSavedEvaluation = { id: 100 };

      answerSubmissionRepository.findOne.mockResolvedValue(mockSubmission);
      answerEvaluationRepository.create.mockReturnValue({});
      answerEvaluationRepository.save.mockResolvedValue(mockSavedEvaluation);

      questionRepository.findOne.mockResolvedValue({ content: 'Question' });
      questionSolutionRepository.findOne.mockResolvedValue({});
      llmService.callWithSchema.mockResolvedValue({});

      const result = await service.evaluate(1);

      expect(result).toEqual({ evaluationId: 100 });
      expect(answerEvaluationRepository.create).toHaveBeenCalledWith({
        submissionId: 1,
      });
      expect(answerEvaluationRepository.save).toHaveBeenCalled();
    });
  });

  describe('aiEvaluate', () => {
    it('LLM 호출 후 점수를 계산하고 엔티티를 업데이트해야 한다', async () => {
      const mockSubmission = {
        id: 1,
        questionId: 10,
        rawAnswer: 'User Answer',
      } as AnswerSubmission;
      const mockQuestion = { content: 'Question Content' };
      const mockSolution = {
        standardDefinition: 'def',
        technicalMechanism: {},
        keyTerminology: [],
        practicalApplication: '',
        commonMisconceptions: '',
      };
      const mockLlmResult = {
        accuracy_level: AccuracyEval.PERFECT,
        accuracy_reason: 'Good',
        logic_level: LogicEval.CLEAR,
        logic_reason: 'Logic',
        depth_level: DepthEval.DEEP,
        depth_reason: 'Deep',
        is_complete_sentence: true,
        has_application: true,
        mentoring_feedback: 'Excellent',
      };

      questionRepository.findOne.mockResolvedValue(mockQuestion);
      questionSolutionRepository.findOne.mockResolvedValue(mockSolution);
      llmService.callWithSchema.mockResolvedValue(mockLlmResult);

      await service.aiEvaluate(100, mockSubmission);

      expect(llmService.callWithSchema).toHaveBeenCalled();
      expect(dataSource.transaction).toHaveBeenCalled();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        AnswerEvaluation,
        100,
        expect.objectContaining({
          feedbackMessage: 'Excellent',
          scoreDetails: {
            accuracy: 35,
            logic: 30,
            depth: 25,
            completeness: 5,
            application: 5,
          },
          accuracyEval: AccuracyEval.PERFECT,
        }),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        AnswerSubmission,
        1,
        expect.objectContaining({
          evaluationStatus: EvaluationStatus.COMPLETED,
        }),
      );
    });

    it('에러 발생 시 Submission Status를 FAILED로 업데이트해야 한다', async () => {
      const mockSubmission = {
        id: 1,
        questionId: 10,
        rawAnswer: 'User Answer',
      } as AnswerSubmission;
      questionRepository.findOne.mockRejectedValue(new Error('DB Error'));

      await service.aiEvaluate(100, mockSubmission);

      expect(answerSubmissionRepository.update).toHaveBeenCalledWith(1, {
        evaluationStatus: EvaluationStatus.FAILED,
      });
    });
  });

  describe('getEvaluationById', () => {
    it('평가 결과가 존재하면 해당 엔티티를 반환해야 한다', async () => {
      const mockEvaluation = { id: 1 };
      answerEvaluationRepository.findOne.mockResolvedValue(mockEvaluation);

      const result = await service.getEvaluationBySubmissionId(1);

      expect(result).toEqual(mockEvaluation);
      expect(answerEvaluationRepository.findOne).toHaveBeenCalledWith({
        where: { submissionId: 1 },
      });
    });

    it('평가 결과가 없으면 NotFoundException을 던져야 한다', async () => {
      answerEvaluationRepository.findOne.mockResolvedValue(null);

      await expect(service.getEvaluationBySubmissionId(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
