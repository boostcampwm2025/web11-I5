/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AnswerSubmissionService } from './answer-submission.service';
import { AnswerSubmission } from './entities/answer-submission.entity';
import { AudioAsset } from '../audio-stream/entities/audio-asset.entity';
import { Question } from '../question/entities/question.entity';
import { SttService } from '../stt/stt.service';
import { StreaksService } from '../streaks/streaks.service';
import { EvaluationStatus } from '../answer-evaluation/answer-evaluation.constants';
import {
  QuizMode,
  ProcessStatus,
  InputType,
} from './answer-submission.constants';

const mockAnswerSubmissionRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockAudioAssetRepository = {
  findOne: jest.fn(),
};

const mockQuestionRepository = {
  findOne: jest.fn(),
};

const mockSttService = {
  requestStt: jest.fn(),
};

const mockStreaksService = {
  recordDailyActivity: jest.fn(),
};

describe('AnswerSubmissionService', () => {
  let service: AnswerSubmissionService;
  let answerSubmissionRepository: Repository<AnswerSubmission>;
  let audioAssetRepository: Repository<AudioAsset>;
  let questionRepository: Repository<Question>;
  let sttService: SttService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerSubmissionService,
        {
          provide: getRepositoryToken(AnswerSubmission),
          useValue: mockAnswerSubmissionRepository,
        },
        {
          provide: getRepositoryToken(AudioAsset),
          useValue: mockAudioAssetRepository,
        },
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: SttService,
          useValue: mockSttService,
        },
        {
          provide: StreaksService,
          useValue: mockStreaksService,
        },
      ],
    }).compile();

    service = module.get<AnswerSubmissionService>(AnswerSubmissionService);
    answerSubmissionRepository = module.get<Repository<AnswerSubmission>>(
      getRepositoryToken(AnswerSubmission),
    );
    audioAssetRepository = module.get<Repository<AudioAsset>>(
      getRepositoryToken(AudioAsset),
    );
    questionRepository = module.get<Repository<Question>>(
      getRepositoryToken(Question),
    );
    sttService = module.get<SttService>(SttService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitAnswer', () => {
    it('성공: 유효한 audioAssetId와 questionId로 답변 제출을 생성하고 STT를 요청해야 한다', async () => {
      const userId = 1;
      const submitAnswerDto = {
        audioAssetId: 10,
        questionId: 20,
      };

      const mockAudioAsset = {
        id: 10,
        objectKey: 'audio/test.pcm',
        durationMs: 5000,
      } as AudioAsset;

      const mockQuestion = {
        id: 20,
        title: 'Test Question',
      } as Question;

      const mockCreatedSubmission = {
        id: 1,
        userId,
        questionId: 20,
        audioAssetId: 10,
        quizMode: QuizMode.DAILY,
        inputType: InputType.VOICE,
        rawAnswer: '',
        takenTime: 5000,
        sttStatus: ProcessStatus.PENDING,
        evaluationStatus: EvaluationStatus.PENDING,
      } as AnswerSubmission;

      mockAudioAssetRepository.findOne.mockResolvedValue(mockAudioAsset);
      mockQuestionRepository.findOne.mockResolvedValue(mockQuestion);
      mockAnswerSubmissionRepository.create.mockReturnValue(
        mockCreatedSubmission,
      );
      mockAnswerSubmissionRepository.save.mockResolvedValue(
        mockCreatedSubmission,
      );
      mockSttService.requestStt.mockResolvedValue(undefined);
      mockStreaksService.recordDailyActivity.mockResolvedValue({
        success: true,
      });

      const result = await service.submitAnswer(userId, submitAnswerDto);

      expect(audioAssetRepository.findOne).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(questionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 20 },
      });
      expect(answerSubmissionRepository.create).toHaveBeenCalledWith({
        userId,
        questionId: 20,
        audioAssetId: 10,
        quizMode: QuizMode.DAILY,
        inputType: InputType.VOICE,
        rawAnswer: '',
        takenTime: 5000,
        sttStatus: ProcessStatus.PENDING,
        evaluationStatus: EvaluationStatus.PENDING,
      });
      expect(answerSubmissionRepository.save).toHaveBeenCalledWith(
        mockCreatedSubmission,
      );
      expect(sttService.requestStt).toHaveBeenCalledWith(mockAudioAsset);
      expect(mockStreaksService.recordDailyActivity).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(mockCreatedSubmission);
    });

    it('실패: audioAssetId가 존재하지 않으면 NotFoundException을 발생시켜야 한다', async () => {
      const userId = 1;
      const submitAnswerDto = {
        audioAssetId: 999,
        questionId: 20,
      };

      mockAudioAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.submitAnswer(userId, submitAnswerDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.submitAnswer(userId, submitAnswerDto),
      ).rejects.toThrow('Audio asset with ID 999 not found');
    });

    it('실패: audioAsset에 objectKey가 없으면 BadRequestException을 발생시켜야 한다', async () => {
      const userId = 1;
      const submitAnswerDto = {
        audioAssetId: 10,
        questionId: 20,
      };

      const mockAudioAsset = {
        id: 10,
        objectKey: null,
        durationMs: 5000,
      } as AudioAsset;

      mockAudioAssetRepository.findOne.mockResolvedValue(mockAudioAsset);

      await expect(
        service.submitAnswer(userId, submitAnswerDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.submitAnswer(userId, submitAnswerDto),
      ).rejects.toThrow(
        'Audio asset 10 not uploaded to object storage, missing objectKey',
      );
    });

    it('실패: questionId가 존재하지 않으면 NotFoundException을 발생시켜야 한다', async () => {
      const userId = 1;
      const submitAnswerDto = {
        audioAssetId: 10,
        questionId: 999,
      };

      const mockAudioAsset = {
        id: 10,
        objectKey: 'audio/test.pcm',
        durationMs: 5000,
      } as AudioAsset;

      mockAudioAssetRepository.findOne.mockResolvedValue(mockAudioAsset);
      mockQuestionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.submitAnswer(userId, submitAnswerDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.submitAnswer(userId, submitAnswerDto),
      ).rejects.toThrow('Question with ID 999 not found');
    });
  });

  describe('updateSttResult', () => {
    it('성공: STT 성공 시 답변 제출의 rawAnswer와 sttStatus를 업데이트해야 한다', async () => {
      const audioAssetId = 10;
      const sttText = 'This is the transcribed text';
      const isSuccess = true;

      const mockSubmission = {
        id: 1,
        audioAssetId,
        rawAnswer: '',
        sttStatus: ProcessStatus.PENDING,
      } as AnswerSubmission;

      const updatedSubmission = {
        ...mockSubmission,
        rawAnswer: sttText,
        sttStatus: ProcessStatus.DONE,
      };

      mockAnswerSubmissionRepository.findOne.mockResolvedValue(mockSubmission);
      mockAnswerSubmissionRepository.save.mockResolvedValue(updatedSubmission);

      const result = await service.updateSttResult(
        audioAssetId,
        sttText,
        isSuccess,
      );

      expect(answerSubmissionRepository.findOne).toHaveBeenCalledWith({
        where: { audioAssetId },
      });
      expect(answerSubmissionRepository.save).toHaveBeenCalledWith({
        id: 1,
        audioAssetId,
        rawAnswer: sttText,
        sttStatus: ProcessStatus.DONE,
      });
      expect(result.rawAnswer).toBe(sttText);
      expect(result.sttStatus).toBe(ProcessStatus.DONE);
    });

    it('성공: STT 실패 시 sttStatus를 FAILED로 업데이트해야 한다', async () => {
      const audioAssetId = 10;
      const sttText = '';
      const isSuccess = false;

      const mockSubmission = {
        id: 1,
        audioAssetId,
        rawAnswer: '',
        sttStatus: ProcessStatus.PENDING,
      } as AnswerSubmission;

      const updatedSubmission = {
        ...mockSubmission,
        rawAnswer: sttText,
        sttStatus: ProcessStatus.FAILED,
      };

      mockAnswerSubmissionRepository.findOne.mockResolvedValue(mockSubmission);
      mockAnswerSubmissionRepository.save.mockResolvedValue(updatedSubmission);

      const result = await service.updateSttResult(
        audioAssetId,
        sttText,
        isSuccess,
      );

      expect(result.sttStatus).toBe(ProcessStatus.FAILED);
      expect(result.rawAnswer).toBe('');
    });

    it('실패: audioAssetId에 해당하는 답변 제출이 없으면 NotFoundException을 발생시켜야 한다', async () => {
      const audioAssetId = 999;
      const sttText = 'test';
      const isSuccess = true;

      mockAnswerSubmissionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateSttResult(audioAssetId, sttText, isSuccess),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateSttResult(audioAssetId, sttText, isSuccess),
      ).rejects.toThrow('Answer submission with audioAssetId 999 not found');
    });
  });

  describe('getHistoryListByQuestionId', () => {
    it('성공: questionId와 userId에 해당하는 제출 기록을 DTO로 변환하여 반환해야 한다', async () => {
      const userId = 1;
      const questionId = 100;
      const mockDate = new Date();

      const mockEntities = [
        {
          id: 1,
          userId,
          questionId,
          quizMode: QuizMode.DAILY,
          submittedAt: mockDate,
          audioAssetId: 55,
          evaluationStatus: EvaluationStatus.PENDING,
          sttStatus: ProcessStatus.DONE,
          inputType: InputType.VOICE,
          rawAnswer: 'test answer',
          score: 0,
          takenTime: 10,
        },
      ] as AnswerSubmission[];

      mockAnswerSubmissionRepository.find.mockResolvedValue(mockEntities);

      const result = await service.getHistoryListByQuestionId(
        userId,
        questionId,
      );

      expect(answerSubmissionRepository.find).toHaveBeenCalledWith({
        where: {
          userId,
          questionId,
          quizMode: QuizMode.DAILY,
        },
        order: {
          submittedAt: 'ASC',
        },
      });

      expect(result).toHaveLength(1);

      expect(result[0]).toEqual({
        id: 1,
        questionId: 100,
        submittedAt: mockDate,
        audioAssetId: 55,
        evaluationStatus: EvaluationStatus.PENDING,
        sttStatus: ProcessStatus.DONE,
        inputType: InputType.VOICE,
        answerContent: 'test answer',
        totalScore: 0,
        duration: 10,
      });
    });

    it('성공: 데이터가 없을 경우 빈 배열을 반환해야 한다', async () => {
      const userId = 1;
      const questionId = 999;
      mockAnswerSubmissionRepository.find.mockResolvedValue([]);

      const result = await service.getHistoryListByQuestionId(
        userId,
        questionId,
      );

      expect(answerSubmissionRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });
});
