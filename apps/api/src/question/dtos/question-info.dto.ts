import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ParentCategoryInfoDto {
  @ApiProperty({ description: '상위 카테고리 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '상위 카테고리 이름', example: '백엔드' })
  name: string;
}

class CategoryInfoDto {
  @ApiProperty({ description: '카테고리 ID', example: 2 })
  id: number;

  @ApiProperty({ description: '카테고리 이름', example: 'API 설계' })
  name: string;

  @ApiPropertyOptional({
    description: '상위 카테고리 정보',
    type: ParentCategoryInfoDto,
    nullable: true,
  })
  parent: ParentCategoryInfoDto | null;
}

export class QuestionInfoDto {
  @ApiProperty({ description: '문제 ID', example: 1 })
  id: number;

  @ApiProperty({
    description: '문제 제목',
    example: 'REST API와 GraphQL의 차이점을 설명해주세요.',
  })
  title: string;

  @ApiProperty({
    description: '문제 내용 (상세보기에서만 사용)',
    example: 'REST API와 GraphQL의 차이점을 설명해주세요.',
    nullable: true,
  })
  content?: string;

  @ApiProperty({ description: '카테고리 정보', type: CategoryInfoDto })
  category: CategoryInfoDto;
}
