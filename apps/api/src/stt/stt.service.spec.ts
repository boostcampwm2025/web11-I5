import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SttService } from './stt.service';
import { AudioAsset } from '../uploads/entities/audio-asset.entity';

const mockFetch = jest.fn();

describe('SttService', () => {
  let service: SttService;

  beforeEach(async () => {
    global.fetch = mockFetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SttService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                NCLOUD_CLOVA_SPEECH_INVOKE_URL:
                  'https://naver-speech.example.com',
                NCLOUD_CLOVA_SPEECH_SECRET_KEY: 'secret-key',
                STT_CALLBACK_URL: 'https://api.example.com',
              };
              return config[key];
            }),
          },
        },
        {
          provide: Logger,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SttService>(SttService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestStt', () => {
    it('AudioAsset 정보로 STT API를 호출하고 결과를 반환해야 한다', async () => {
      const audioAsset = {
        id: 1,
        objectKey: 'audio-sessions/uuid.wav',
        userId: 10,
      } as AudioAsset;

      const mockSttResponse = { result: 'async', taskId: 'task-123' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSttResponse),
      });

      const result = (await service.requestStt(audioAsset)) as {
        result: string;
        taskId: string;
      };

      expect(mockFetch).toHaveBeenCalledWith(
        'https://naver-speech.example.com/recognizer/object-storage',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CLOVASPEECH-API-KEY': 'secret-key',
          },
          body: JSON.stringify({
            dataKey: audioAsset.objectKey,
            language: 'ko-KR',
            completion: 'async',
            callback: `https://api.example.com/stt/callback?audioAssetId=${audioAsset.id}`,
          }),
        }),
      );
      expect(result).toEqual(mockSttResponse);
    });

    it('API 응답이 ok가 아니면 Error를 발생시켜야 한다', async () => {
      const audioAsset = { id: 1, objectKey: 'key.wav' } as AudioAsset;
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(service.requestStt(audioAsset)).rejects.toThrow(
        'NCP Clova Speech API Error',
      );
    });

    it('fetch 실패 시 에러를 그대로 전파해야 한다', async () => {
      const audioAsset = { id: 1, objectKey: 'key.wav' } as AudioAsset;
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValue(networkError);

      await expect(service.requestStt(audioAsset)).rejects.toThrow(
        'Network error',
      );
    });
  });
});
