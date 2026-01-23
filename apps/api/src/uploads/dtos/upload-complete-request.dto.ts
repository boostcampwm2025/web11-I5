import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class UploadCompleteRequestDto {
  @ApiProperty({ description: 'Audio Asset ID' })
  @IsInt()
  assetId: number;

  @ApiProperty({ description: '실제 파일 크기 (bytes)' })
  @IsInt()
  byteSize: number;

  @ApiPropertyOptional({ description: '오디오 길이 (milliseconds)' })
  @IsOptional()
  @IsInt()
  durationMs?: number;
}
