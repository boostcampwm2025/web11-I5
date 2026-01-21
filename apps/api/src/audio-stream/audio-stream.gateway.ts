import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AudioStreamService } from './audio-stream.service';
import { AudioChunkRequestDto } from './dtos/audio-chunk.dto';

/**
 * AudioStreamGateway
 * Socket.io를 통한 오디오 청크 스트리밍만 담당
 * 세션 시작/종료는 REST API(AudioStreamController)에서 처리
 */
@WebSocketGateway({
  cors: {
    origin: '*', // MVP: CORS 설정 단순화
  },
})
export class AudioStreamGateway {
  private readonly logger = new Logger(AudioStreamGateway.name);

  constructor(private readonly audioStreamService: AudioStreamService) {}

  /**
   * audio.chunk 이벤트 핸들러
   * 오디오 청크를 수신하여 저장한다.
   */
  @SubscribeMessage('audio.chunk')
  async handleChunk(
    @MessageBody() data: AudioChunkRequestDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      await this.audioStreamService.saveChunk(
        data.sessionId,
        data.seq,
        data.bytes,
      );
    } catch (error) {
      // 청크 저장 실패는 클라이언트에 전파하지 않고 로그만 남김
      // (back pressure로 인한 지연 청크는 무시해도 됨)
      this.logger.warn(
        `Failed to save chunk for client ${client.id}, session ${data.sessionId}`,
        error,
      );
    }
  }
}
