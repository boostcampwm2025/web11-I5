/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SttController } from './stt.controller';
import { AnswerSubmissionService } from '../answer-submission/answer-submission.service';
import { AnswerEvaluationService } from '../answer-evaluation/answer-evaluation.service';
import { LlmService } from '../llm/llm.service';
import { SttResult } from './dtos/stt-result.dto';
import { ProcessStatus } from '../answer-submission/answer-submission.constants';
import { AnswerSubmission } from '../answer-submission/entities/answer-submission.entity';

const flushPromises = () => new Promise(setImmediate);

describe('SttController', () => {
  let controller: SttController;
  let answerSubmissionService: AnswerSubmissionService;
  let answerEvaluationService: AnswerEvaluationService;
  let llmService: LlmService;

  const mockAnswerSubmissionService = {
    updateSttResult: jest.fn(),
  };

  const mockAnswerEvaluationService = {
    evaluate: jest.fn(),
  };

  const mockLlmService = {
    callWithSchema: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SttController],
      providers: [
        {
          provide: AnswerSubmissionService,
          useValue: mockAnswerSubmissionService,
        },
        {
          provide: AnswerEvaluationService,
          useValue: mockAnswerEvaluationService,
        },
        {
          provide: LlmService,
          useValue: mockLlmService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
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

    controller = module.get<SttController>(SttController);
    answerSubmissionService = module.get<AnswerSubmissionService>(
      AnswerSubmissionService,
    );
    answerEvaluationService = module.get<AnswerEvaluationService>(
      AnswerEvaluationService,
    );
    llmService = module.get<LlmService>(LlmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockSttData = (
    result: string,
    text?: string,
  ): Partial<SttResult> => ({
    result,
    text,
    token: 'test-token',
    message: result === 'SUCCEEDED' ? 'Succeeded' : 'Failed',
    version: '1.0',
    params: {
      service: 'test',
      domain: 'test',
      lang: 'ko',
      completion: 'sync',
      callback: 'http://test',
      diarization: { enable: false, speakerCountMin: 1, speakerCountMax: 1 },
      sed: { enable: false },
      boostings: [],
      forbiddens: '',
      wordAlignment: false,
      fullText: true,
      noiseFiltering: false,
      resultToObs: false,
      priority: 0,
      userdata: {
        _ncp_DomainCode: 'test',
        _ncp_DomainId: 1,
        _ncp_TaskId: 1,
        _ncp_TraceId: 'test',
      },
    },
    progress: 100,
    segments: [],
    confidence: 0.95,
    speakers: [],
    events: [],
    eventTypes: [],
  });

  describe('sttResultCallback', () => {
    it('성공: 콜백은 즉시 성공을 반환해야 한다', () => {
      const audioAssetId = 10;
      const sttData = createMockSttData(
        'SUCCEEDED',
        'This is the transcribed text',
      ) as SttResult;

      mockLlmService.callWithSchema.mockResolvedValue({
        postProcessed: 'Processed text',
      });
      mockAnswerSubmissionService.updateSttResult.mockResolvedValue({
        id: 1,
      } as AnswerSubmission);
      mockAnswerEvaluationService.evaluate.mockResolvedValue({});

      const result = controller.sttResultCallback(audioAssetId, sttData);

      expect(result).toEqual({ success: true });
    });

    it('성공: STT 성공 시 LLM 후처리 후 답변 제출을 업데이트하고 체점을 시작해야 한다', async () => {
      const audioAssetId = 10;
      const sttData = createMockSttData(
        'SUCCEEDED',
        'This is the transcribed text',
      ) as SttResult;

      const mockSubmission = {
        id: 1,
        audioAssetId,
        rawAnswer: 'Processed text',
        sttStatus: ProcessStatus.DONE,
      } as AnswerSubmission;

      mockLlmService.callWithSchema.mockResolvedValue({
        postProcessed: 'Processed text',
      });
      mockAnswerSubmissionService.updateSttResult.mockResolvedValue(
        mockSubmission,
      );
      mockAnswerEvaluationService.evaluate.mockResolvedValue({
        evaluationId: 100,
      });

      controller.sttResultCallback(audioAssetId, sttData);

      await flushPromises();

      expect(llmService.callWithSchema).toHaveBeenCalled();
      expect(answerSubmissionService.updateSttResult).toHaveBeenCalledWith(
        audioAssetId,
        'Processed text',
        true,
      );
      expect(answerEvaluationService.evaluate).toHaveBeenCalledWith(1);
    });

    it('성공: STT 실패 시 답변 제출을 FAILED로 업데이트하고 체점을 시작하지 않아야 한다', async () => {
      const audioAssetId = 10;
      const sttData = createMockSttData('FAILED', '') as SttResult;

      const mockSubmission = {
        id: 1,
        audioAssetId,
        rawAnswer: '',
        sttStatus: ProcessStatus.FAILED,
      } as AnswerSubmission;

      mockLlmService.callWithSchema.mockResolvedValue({
        postProcessed: '',
      });
      mockAnswerSubmissionService.updateSttResult.mockResolvedValue(
        mockSubmission,
      );

      controller.sttResultCallback(audioAssetId, sttData);

      await flushPromises();

      expect(answerSubmissionService.updateSttResult).toHaveBeenCalledWith(
        audioAssetId,
        '',
        false,
      );
      expect(answerEvaluationService.evaluate).not.toHaveBeenCalled();
    });

    it('성공: LLM 후처리 결과가 없으면 원본 STT 텍스트를 사용해야 한다', async () => {
      const audioAssetId = 10;
      const originalText = 'Original STT text';
      const sttData = createMockSttData('SUCCEEDED', originalText) as SttResult;

      const mockSubmission = {
        id: 1,
        audioAssetId,
        rawAnswer: originalText,
        sttStatus: ProcessStatus.DONE,
      } as AnswerSubmission;

      mockLlmService.callWithSchema.mockResolvedValue({
        postProcessed: '',
      });
      mockAnswerSubmissionService.updateSttResult.mockResolvedValue(
        mockSubmission,
      );
      mockAnswerEvaluationService.evaluate.mockResolvedValue({});

      controller.sttResultCallback(audioAssetId, sttData);

      await flushPromises();

      expect(answerSubmissionService.updateSttResult).toHaveBeenCalledWith(
        audioAssetId,
        originalText,
        true,
      );
    });

    it('성공: 백그라운드 처리 실패 시에도 콜백은 성공을 반환해야 한다', async () => {
      const audioAssetId = 10;
      const sttData = createMockSttData('SUCCEEDED', 'test text') as SttResult;

      mockLlmService.callWithSchema.mockRejectedValue(new Error('LLM error'));

      const result = controller.sttResultCallback(audioAssetId, sttData);

      await flushPromises();

      expect(result).toEqual({ success: true });
    });

    it('성공: 체점 실패 시에도 콜백은 성공을 반환해야 한다', async () => {
      const audioAssetId = 10;
      const sttData = createMockSttData('SUCCEEDED', 'test text') as SttResult;

      const mockSubmission = {
        id: 1,
        audioAssetId,
        rawAnswer: 'test text',
        sttStatus: ProcessStatus.DONE,
      } as AnswerSubmission;

      mockLlmService.callWithSchema.mockResolvedValue({
        postProcessed: 'test text',
      });
      mockAnswerSubmissionService.updateSttResult.mockResolvedValue(
        mockSubmission,
      );
      mockAnswerEvaluationService.evaluate.mockRejectedValue(
        new Error('Evaluation failed'),
      );

      const result = controller.sttResultCallback(audioAssetId, sttData);

      await flushPromises();

      expect(result).toEqual({ success: true });
      expect(answerEvaluationService.evaluate).toHaveBeenCalledWith(1);
    });
  });
});
