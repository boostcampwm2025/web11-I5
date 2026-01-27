import { ApiProperty } from '@nestjs/swagger';

export class OtherSubmissionItemDto {
  @ApiProperty({ description: '제출 ID', example: 123 })
  submissionId: number;

  @ApiProperty({ description: '사용자 닉네임', example: 'user_1010' })
  nickname: string;

  @ApiProperty({ description: '총점', example: 100 })
  totalScore: number;

  @ApiProperty({
    description: '제출 시각',
    example: '2023-10-07T11:39:00.000Z',
  })
  submittedAt: Date;
}
