import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

const NICKNAME_MIN_LENGTH = 1;
const NICKNAME_MAX_LENGTH = 20;

export class EditUserRequestDto {
  @ApiProperty({
    description: '닉네임(공백 불가)',
    example: '김개발',
    minLength: NICKNAME_MIN_LENGTH,
    maxLength: NICKNAME_MAX_LENGTH,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'nickname은 문자열이어야 합니다.' })
  @MinLength(NICKNAME_MIN_LENGTH, {
    message: `nickname은 최소 ${NICKNAME_MIN_LENGTH}자여야 합니다.`,
  })
  @MaxLength(NICKNAME_MAX_LENGTH, {
    message: `nickname은 최대 ${NICKNAME_MAX_LENGTH}자여야 합니다.`,
  })
  @Matches(/^\S+$/, { message: 'nickname에는 공백을 포함할 수 없습니다.' })
  nickname?: string;

  @ApiProperty({
    description: 'Object Storage 키',
    example: 'profile-images/uuid-here',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'objectKey는 문자열이어야 합니다.' })
  objectKey?: string;
}
