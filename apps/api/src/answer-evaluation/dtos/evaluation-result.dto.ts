import {
  IsString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsArray,
} from 'class-validator';
import {
  AccuracyEval,
  DepthEval,
  LogicEval,
} from '../answer-evaluation.constants';

export class EvaluationResultDto {
  @IsEnum(AccuracyEval)
  accuracyLevel: AccuracyEval;

  @IsString()
  accuracyReason: string;

  @IsEnum(LogicEval)
  logicLevel: LogicEval;

  @IsString()
  logicReason: string;

  @IsEnum(DepthEval)
  depthLevel: DepthEval;

  @IsString()
  depthReason: string;

  @IsString()
  mentoringFeedback: string;

  @IsOptional()
  @IsObject()
  scoreDetails?: {
    accuracy: number;
    logic: number;
    depth: number;
  };

  @IsOptional()
  @IsNumber()
  totalScore?: number;

  @IsOptional()
  @IsArray()
  extractedKeywords: string[];
}
