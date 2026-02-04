import {
  IsString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsArray,
} from 'class-validator';
import {
  CoreConceptEval,
  CoverageEval,
  DepthEval,
  LogicEval,
} from '@repo/types';
import type { ScoreDetails } from '@repo/types';

export class EvaluationResultDto {
  @IsEnum(CoreConceptEval)
  coreConceptLevel: CoreConceptEval;

  @IsString()
  coreConceptReason: string;

  @IsEnum(CoverageEval)
  coverageLevel: CoverageEval;

  @IsString()
  coverageReason: string;

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

  @IsArray()
  @IsString({ each: true })
  extractedKeywords: string[];

  @IsOptional()
  @IsObject()
  scoreDetails?: ScoreDetails;

  @IsOptional()
  @IsNumber()
  totalScore?: number;
}
