import { IsOptional, IsInt, Min } from 'class-validator';
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
