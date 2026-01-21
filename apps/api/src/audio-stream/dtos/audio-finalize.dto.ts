import { ApiProperty } from '@nestjs/swagger';

/**
 * audio.finalize 이벤트 요청 DTO
 */
export class AudioFinalizeRequestDto {
  @ApiProperty({
    description: '세션 ID',
    example: 'session-12345',
  })
  sessionId: string;
}

/**
 * audio.finalize 이벤트 응답 DTO
 */
export class AudioFinalizeResponseDto {
  @ApiProperty({
    description: '파일 경로',
    example: '/uploads/audio/2024/01/15/audio-12345.wav',
  })
  filePath: string;

  @ApiProperty({
    description: '파일 이름',
    example: 'audio-12345.wav',
  })
  fileName: string;

  @ApiProperty({
    description: '에셋 ID',
    example: 12345,
  })
  assetId: number;
}
