import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class PresignedUrlRequestDto {
  @ApiProperty({ description: '오디오 코덱', example: 'pcm16' })
  @IsString()
  codec: string;

  @ApiProperty({ description: '샘플 레이트', example: 16000 })
  @IsInt()
  @Min(8000)
  @Max(48000)
  sampleRate: number;

  @ApiProperty({ description: '채널 수', example: 1 })
  @IsInt()
  @Min(1)
  @Max(2)
  channels: number;

  @ApiPropertyOptional({
    description: '예상 파일 크기 (bytes)',
    example: 1048576,
  })
  @IsOptional()
  @IsInt()
  @Max(50 * 1024 * 1024) // 50MB 제한
  estimatedSize?: number;
}
