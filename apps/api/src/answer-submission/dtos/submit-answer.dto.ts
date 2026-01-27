import {
  IsInt,
  IsPositive,
  IsDefined,
  IsOptional,
  IsString,
  MinLength,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'atLeastOneAnswer', async: false })
export class AtLeastOneAnswerConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as SubmitAnswerDto;
    const hasAudioAssetId =
      dto.audioAssetId !== undefined && dto.audioAssetId !== null;
    const hasRawAnswer =
      typeof dto.rawAnswer === 'string' && dto.rawAnswer.trim().length > 0;
    return hasAudioAssetId || hasRawAnswer;
  }

  defaultMessage(): string {
    return 'audioAssetId 또는 rawAnswer 중 하나는 필수입니다';
  }
}

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
  @Validate(AtLeastOneAnswerConstraint)
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
