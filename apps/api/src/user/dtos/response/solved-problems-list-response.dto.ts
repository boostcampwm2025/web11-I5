import { ApiProperty } from '@nestjs/swagger';
import { SolvedProblemDto } from './solved-problem.dto';

/**
 * 푼 문제 목록 리스트 응답 래퍼 DTO
 */
export class SolvedProblemsListResponseDto {
  @ApiProperty({
    description: '푼 문제 목록',
    type: [SolvedProblemDto],
  })
  problems: SolvedProblemDto[];

  @ApiProperty({
    description: '푼 문제 갯수',
    example: 15,
  })
  totalCount: number;
}
