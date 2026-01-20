import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AudioStreamService } from './audio-stream.service';
import {
  AudioStartRequestDto,
  AudioStartResponseDto,
} from './dtos/audio-start.dto';
import {
  AudioFinalizeRequestDto,
  AudioFinalizeResponseDto,
} from './dtos/audio-finalize.dto';

/**
 * AudioStreamController
 * 오디오 스트리밍 세션 시작/종료를 REST API로 처리
 */
@ApiTags('audio-stream')
@Controller('audio-stream')
export class AudioStreamController {
  private readonly logger = new Logger(AudioStreamController.name);

  constructor(private readonly audioStreamService: AudioStreamService) {}

  /**
   * POST /audio-stream/start
   * 새로운 오디오 스트리밍 세션을 시작한다.
   */
  @Post('start')
  @ApiOperation({ summary: '오디오 스트리밍 세션 시작' })
  @ApiBody({ type: AudioStartRequestDto })
  @ApiResponse({
    status: 200,
    description: '세션 시작 성공',
    type: AudioStartResponseDto,
  })
  async start(
    @Body() data: AudioStartRequestDto,
  ): Promise<AudioStartResponseDto> {
    this.logger.log(
      `POST /audio-stream/start: codec=${data.codec}, sampleRate=${data.sampleRate}, channels=${data.channels}`,
    );

    try {
      const sessionId = await this.audioStreamService.startSession(
        data.codec,
        data.sampleRate,
        data.channels,
      );

      return { sessionId };
    } catch (error) {
      this.logger.error('Failed to start session', error);
      throw error;
    }
  }

  /**
   * POST /audio-stream/finalize
   * 오디오 스트리밍을 종료하고 최종 파일 정보를 반환한다.
   */
  @Post('finalize')
  @ApiOperation({ summary: '오디오 스트리밍 세션 종료' })
  @ApiBody({ type: AudioFinalizeRequestDto })
  @ApiResponse({
    status: 200,
    description: '세션 종료 성공',
    type: AudioFinalizeResponseDto,
  })
  async finalize(
    @Body() data: AudioFinalizeRequestDto,
  ): Promise<AudioFinalizeResponseDto> {
    this.logger.log(`POST /audio-stream/finalize: session=${data.sessionId}`);

    try {
      const result = await this.audioStreamService.finalizeSession(
        data.sessionId,
        1, // TODO: 실제 userID로 변경하기
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to finalize session ${data.sessionId}`, error);
      throw error;
    }
  }

  /**
   * GET /audio-stream/upload-status/:assetId
   * 오디오 파일 업로드 상태를 조회한다.
   */
  @Get('upload-status/:assetId')
  @ApiOperation({ summary: '오디오 파일 업로드 상태 조회' })
  @ApiResponse({
    status: 200,
    description: '업로드 상태 조회 성공',
  })
  async getUploadStatus(
    @Param('assetId', ParseIntPipe) assetId: number,
  ): Promise<{ uploadStatus: string }> {
    const asset = await this.audioStreamService.findAudioAsset(assetId);

    if (!asset) {
      return { uploadStatus: 'not_found' };
    }

    return { uploadStatus: asset.uploadStatus };
  }
}
