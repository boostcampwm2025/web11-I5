import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const NICKNAME_MIN_LENGTH = 1;
const NICKNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 6;
const EMAIL_MAX_LENGTH = 320;

export class CreateUserRequestDto {
  @ApiProperty({
    description: '사용자 닉네임(공백 불가)',
    example: 'user123',
    minLength: NICKNAME_MIN_LENGTH,
    maxLength: NICKNAME_MAX_LENGTH,
  })
  @IsString({ message: 'nickname은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'nickname은 필수입니다.' })
  @MinLength(NICKNAME_MIN_LENGTH, {
    message: `nickname은 최소 ${NICKNAME_MIN_LENGTH}자여야 합니다.`,
  })
  @MaxLength(NICKNAME_MAX_LENGTH, {
    message: `nickname은 최대 ${NICKNAME_MAX_LENGTH}자여야 합니다.`,
  })
  @Matches(/^\S+$/, { message: 'nickname에는 공백을 포함할 수 없습니다.' })
  nickname: string;

  @ApiProperty({
    description: '이메일',
    example: 'test@example.com',
  })
  @IsString({ message: 'email은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'email은 필수입니다.' })
  @MaxLength(EMAIL_MAX_LENGTH, {
    message: `email은 최대 ${EMAIL_MAX_LENGTH}자여야 합니다.`,
  })
  @IsEmail({}, { message: 'email 형식이 올바르지 않습니다.' })
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'test123',
    minLength: PASSWORD_MIN_LENGTH,
  })
  @IsString({ message: 'password는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'password는 필수입니다.' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `password는 최소 ${PASSWORD_MIN_LENGTH}자여야 합니다.`,
  })
  password: string;
}
