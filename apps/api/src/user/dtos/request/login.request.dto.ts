import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const PASSWORD_MIN_LENGTH = 6;
const EMAIL_MAX_LENGTH = 320;

export class LoginRequestDto {
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
