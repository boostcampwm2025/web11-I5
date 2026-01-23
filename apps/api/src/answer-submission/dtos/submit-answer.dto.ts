import {
  IsInt,
  IsPositive,
  IsDefined,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiPropertyOptional({
    description: '오디오 에셋 ID (음성 답변 시 필수, 텍스트 답변 시 생략 가능)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  audioAssetId?: number;

  @ApiProperty({
    description: '질문 ID',
    example: 1,
  })
  @IsDefined()
  @IsInt()
  @IsPositive()
  questionId: number;

  @ApiPropertyOptional({
    description: '텍스트 답변 내용 (텍스트 답변 시 필수)',
    example: 'React는 UI를 구축하기 위한 JavaScript 라이브러리입니다.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  rawAnswer?: string;
}
