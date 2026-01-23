import { ApiProperty } from '@nestjs/swagger';
import { Question } from '../entities/question.entity';

export class PaginatedQuestionsDto {
  @ApiProperty({ type: [Question], description: '질문 목록' })
  questions: (Question & { score: number | null })[];

  @ApiProperty({ example: 100, description: '필터링된 전체 질문 수' })
  totalCount: number;

  @ApiProperty({ example: 15, description: '페이지당 질문 수' })
  pageSize: number;

  @ApiProperty({ example: 1, description: '현재 페이지 번호' })
  currentPage: number;

  @ApiProperty({ example: 7, description: '전체 페이지 수' })
  totalPages: number;
}
