import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * audio.finalize 이벤트 요청 DTO
 */
export class AudioFinalizeRequestDto {
  @ApiProperty({
    description: '세션 ID',
    example: 'session-12345',
  })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({
    description:
      '클라이언트가 전송한 마지막 청크의 seq 번호 (이 seq까지 수신 대기)',
    example: 42,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  lastSeq?: number;
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
