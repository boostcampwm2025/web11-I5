import { ApiProperty } from '@nestjs/swagger';

/**
 * 푼 문제 단건 응답 DTO
 */
export class SolvedProblemDto {
  @ApiProperty({
    description: '문제 ID',
    example: 1,
  })
  questionId: number;

  @ApiProperty({
    description: '문제 제목',
    example: 'React란 무엇인가요?',
  })
  title: string;

  @ApiProperty({
    description: '문제 분류(카테고리)',
    example: 'JavaScript',
  })
  category: string;

  @ApiProperty({
    description: '문제 분류(상위 카테고리)',
    example: '프론트엔드',
  })
  parentCategory: string;

  @ApiProperty({
    description: '풀이 완료 시각 (ISO-8601 포맷)',
    example: '2026-01-21T10:30:00.000Z',
  })
  completedAt: string;

  @ApiProperty({
    description: '리포트 ID (제출 ID)',
    example: 123,
  })
  reportId: number;

  @ApiProperty({
    description: '문제 풀이 점수 (0~100)',
    example: 85,
  })
  score: number;
}
