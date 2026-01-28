import { ApiProperty } from '@nestjs/swagger';

export class YearlyAnswerSubmissionsDto {
  @ApiProperty({ description: '제출 ID', example: 1 })
  id: number;

  @ApiProperty({
    description: '제출 일시',
  })
  submittedAt: Date;

  @ApiProperty({ description: '문제 ID', example: 10 })
  questionId: number;

  @ApiProperty({ description: '문제 제목', example: 'HTTP와 HTTPS의 차이' })
  title: string;
}
export class GetYearlyActivityCountResponseDto {
  @ApiProperty({
    description: '연간 고유 문제 제출 수',
    example: 120,
  })
  submittedQuestionCount: number;

  @ApiProperty({
    description: '문제 제출 상세 정보',
    type: [YearlyAnswerSubmissionsDto],
  })
  yearlyAnswerSubmissions: YearlyAnswerSubmissionsDto[];
}

export class GetConsecutiveDayCountResponseDto {
  @ApiProperty({
    description: '연속 학습일 수',
    example: 30,
  })
  consecutiveDayCount: number;
}
