import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

const EMAIL_MAX_LENGTH = 320;
const CODE_LENGTH = 6;

export class CheckVerificationCodeRequestDto {
  @ApiProperty({
    description: '인증받을 이메일',
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
    description: '6자리 인증 코드',
    example: '1a2b3c',
    minLength: CODE_LENGTH,
    maxLength: CODE_LENGTH,
  })
  @IsString({ message: 'code는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'code는 필수입니다.' })
  @Length(CODE_LENGTH, CODE_LENGTH, {
    message: `code는 ${CODE_LENGTH}자여야 합니다.`,
  })
  code: string;
}
