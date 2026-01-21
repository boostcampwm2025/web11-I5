import { ApiProperty } from '@nestjs/swagger';

export class GetYearlyActivityCountResponseDto {
  @ApiProperty({
    description: '연간 학습일 수',
    example: 120,
  })
  streakCount: number;
}

export class GetConsecutiveDayCountResponseDto {
  @ApiProperty({
    description: '연속 학습일 수',
    example: 30,
  })
  consecutiveDayCount: number;
}
