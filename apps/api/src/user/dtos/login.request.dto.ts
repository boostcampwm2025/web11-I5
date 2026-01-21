import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    description: '사용자 닉네임',
    example: '테스트 유저',
  })
  nickname: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'test123',
  })
  password: string;
}
