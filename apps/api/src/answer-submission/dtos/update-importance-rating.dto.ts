import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateImportanceDto {
  @IsNumber()
  @IsNotEmpty()
  questionId: number;

  @IsNumber()
  @Min(0)
  @Max(5) // 0~5점 사이 등으로 제한
  selfImportanceRating: number;
}
