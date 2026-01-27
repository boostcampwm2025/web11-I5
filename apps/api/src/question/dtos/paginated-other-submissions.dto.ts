import { ApiProperty } from '@nestjs/swagger';
import { OtherSubmissionItemDto } from './other-submission-item.dto';

export class PaginatedOtherSubmissionsDto {
  @ApiProperty({
    type: [OtherSubmissionItemDto],
    description: '다른 사용자들의 제출 목록',
  })
  submissions: OtherSubmissionItemDto[];

  @ApiProperty({ example: 45, description: '전체 제출 수' })
  totalCount: number;

  @ApiProperty({ example: 10, description: '페이지당 제출 수' })
  pageSize: number;

  @ApiProperty({ example: 1, description: '현재 페이지 번호' })
  currentPage: number;

  @ApiProperty({ example: 5, description: '전체 페이지 수' })
  totalPages: number;
}
