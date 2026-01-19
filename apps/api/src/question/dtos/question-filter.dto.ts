import { IsOptional, IsInt, Min, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentCategoryId?: number; // 대분류 ID

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number; // 중분류 ID

  @IsOptional()
  @IsString()
  search?: string; // 문제 제목 검색

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minImportance?: number; // 최소 중요도

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
