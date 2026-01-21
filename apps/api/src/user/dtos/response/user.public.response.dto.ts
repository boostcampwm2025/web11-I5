import { ApiProperty } from '@nestjs/swagger';

export class UserPublicResponseDto {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '이메일', example: 'test@example.com' })
  email: string;

  @ApiProperty({ description: '닉네임', example: 'user123' })
  nickname: string;

  @ApiProperty({ description: '총 포인트', example: 0 })
  totalPoint: number;

  @ApiProperty({ description: '총 점수', example: 0 })
  totalScore: number;

  @ApiProperty({
    description: '생성일시(ISO 문자열)',
    example: '2026-01-21T00:00:00.000Z',
  })
  createdAt: string;
}
