import { ApiProperty } from '@nestjs/swagger';

class UserInfoDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '사용자 닉네임',
    example: 'user123',
    nullable: true,
  })
  nickname: string | null;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '로그인한 사용자 정보',
    type: UserInfoDto,
  })
  user: {
    id: number;
    nickname: string | null;
  };
}
