import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
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
    description:
      'Object Storage 키. null을 보내면 프로필 이미지 삭제, 문자열을 보내면 이미지 변경, 보내지 않으면 변경 없음',
    example: 'profile-images/uuid-here',
    required: false,
    nullable: true,
    type: String,
  })
  @IsOptional()
  @ValidateIf((o: EditUserRequestDto) => o.objectKey !== null)
  @IsString({ message: 'objectKey는 문자열이어야 합니다.' })
  @MinLength(1, { message: 'objectKey는 비어있을 수 없습니다.' })
  objectKey?: string | null;
}
