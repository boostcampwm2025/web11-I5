import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AudioAsset } from 'src/audio-stream/entities/audio-asset.entity';

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);
  private ncpSpeechInvokeUrl?: string;
  private ncpSpeechSecretKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.ncpSpeechInvokeUrl = this.configService.get<string>(
      'NCLOUD_CLOVA_SPEECH_INVOKE_URL',
    );
    this.ncpSpeechSecretKey = this.configService.get<string>(
      'NCLOUD_CLOVA_SPEECH_SECRET_KEY',
    );
  }

  /**
   * stt를 비동기로 요청합니다. 결과는 Object Storage에 저장됩니다.
   */
  requestStt(audioAsset: AudioAsset) {
    const requestUrl = `${this.ncpSpeechInvokeUrl}/recognizer/object-storage`;
    const callbackBaseUrl = this.configService.get<string>('STT_CALLBACK_URL');
    const params = {
      dataKey: audioAsset.objectKey,
      language: 'ko-KR',
      completion: 'async',
      callback: `${callbackBaseUrl}/stt/callback?audioAssetId=${audioAsset.id}`,
      boostings: [
        {
          // TODO: 키워드 부스팅 단어들을 문제별로 다르게 주어야합니다.
          words:
            '아파치,웹서버,프로그래밍,데이터베이스,포트,클라이언트,HTML,CSS,리퀘스트,리스폰스,테스트,브라우저',
        },
      ],
    };

    const sanitizedParams = {
      language: params.language,
      completion: params.completion,
      boostings: params.boostings,
    };
    this.logger.log(
      `STT requested with params: ${JSON.stringify(sanitizedParams)}`,
    );

    return fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CLOVASPEECH-API-KEY': this.ncpSpeechSecretKey ?? '',
      },
      body: JSON.stringify(params),
    });
  }
}
