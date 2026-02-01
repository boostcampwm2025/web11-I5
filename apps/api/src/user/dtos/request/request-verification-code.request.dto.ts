import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const EMAIL_MAX_LENGTH = 320;

export class RequestVerificationCodeRequestDto {
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
}
