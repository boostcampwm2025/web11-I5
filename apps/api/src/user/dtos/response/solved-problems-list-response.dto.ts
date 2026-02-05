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
    description: '전체 문제 개수',
    example: 100,
  })
  totalCount: number;

  @ApiProperty({
    description: '현재 페이지 번호',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: '페이지 크기',
    example: 10,
  })
  pageSize: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 10,
  })
  totalPages: number;
}
