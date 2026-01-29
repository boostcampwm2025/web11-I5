import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AudioAsset } from 'src/uploads/entities/audio-asset.entity';

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
  async requestStt(audioAsset: AudioAsset): Promise<any> {
    const requestUrl = `${this.ncpSpeechInvokeUrl}/recognizer/object-storage`;
    const callbackBaseUrl = this.configService.get<string>('STT_CALLBACK_URL');
    const params = {
      dataKey: audioAsset.objectKey,
      language: 'ko-KR',
      completion: 'async',
      callback: `${callbackBaseUrl}/stt/callback?audioAssetId=${audioAsset.id}`,
    };

    // 키워드 부스팅은 네이버 클라우드 콘솔에서 관리됩니다.
    const sanitizedParams = {
      language: params.language,
      completion: params.completion,
    };
    this.logger.log(
      `STT requested with params: ${JSON.stringify(sanitizedParams)}`,
    );

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CLOVASPEECH-API-KEY': this.ncpSpeechSecretKey ?? '',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('NCP Clova Speech API Error');
      }

      return await response.json();
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? `[requestStt] ${error.stack}`
          : `[requestStt] ${error}`,
      );
      throw error;
    }
  }
}
