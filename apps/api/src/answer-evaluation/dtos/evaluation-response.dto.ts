import { ApiProperty } from '@nestjs/swagger';
import {
  CoreConceptEval,
  CoverageEval,
  LogicEval,
  DepthEval,
  ScoreDetails,
  DetailAnalysis,
} from '@repo/types';

class ScoreDetailsDto implements ScoreDetails {
  @ApiProperty({ description: '핵심 개념 점수', example: 50 })
  coreConcept: number;

  @ApiProperty({ description: '완성도 점수', example: 20 })
  coverage: number;

  @ApiProperty({ description: '논리성 점수', example: 10 })
  logic: number;

  @ApiProperty({ description: '심층성 점수', example: 20 })
  depth: number;
}

class DetailAnalysisDto implements DetailAnalysis {
  @ApiProperty({
    description: '핵심 개념 분석 멘트',
    example: '핵심 개념이 정확하게 이해되었습니다.',
  })
  coreConcept: string;

  @ApiProperty({
    description: '완성도 분석 멘트',
    example: '주요 내용을 대부분 포함하고 있습니다.',
  })
  coverage: string;

  @ApiProperty({
    description: '논리성 분석 멘트',
    example: '논리적 구조가 명확합니다.',
  })
  logic: string;

  @ApiProperty({
    description: '심층성 분석 멘트',
    example: '깊이 있는 설명이 잘 드러납니다.',
  })
  depth: string;
}

export class EvaluationResponseDto {
  @ApiProperty({ description: '평가 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '제출 ID', example: 123 })
  submissionId: number;

  @ApiProperty({
    description: '전체 피드백 메시지',
    example: '잘 작성된 답변이나 예시가 부족합니다.',
    nullable: true,
  })
  feedbackMessage: string | null;

  @ApiProperty({
    description: '상세 분석 내용 (JSON)',
    type: DetailAnalysisDto,
    nullable: true,
  })
  detailAnalysis: DetailAnalysisDto | null;

  @ApiProperty({
    description: '상세 점수 내역 (JSON)',
    type: ScoreDetailsDto,
    nullable: true,
  })
  scoreDetails: ScoreDetailsDto | null;

  @ApiProperty({
    description: '핵심 개념 등급',
    enum: CoreConceptEval,
    example: CoreConceptEval.CORRECT,
    nullable: true,
  })
  coreConceptEval: CoreConceptEval;

  @ApiProperty({
    description: '완성도 등급',
    enum: CoverageEval,
    example: CoverageEval.COMPLETE,
    nullable: true,
  })
  coverageEval: CoverageEval;

  @ApiProperty({
    description: '논리성 등급',
    enum: LogicEval,
    example: LogicEval.CLEAR,
    nullable: true,
  })
  logicEval: LogicEval;

  @ApiProperty({
    description: '심층성 등급',
    enum: DepthEval,
    example: DepthEval.BASIC,
    nullable: true,
  })
  depthEval: DepthEval;

  @ApiProperty({
    description: '추출된 키워드 목록',
    example: ['React', 'HTTP', 'Process'],
    type: [String],
  })
  extractedKeywords: string[];

  @ApiProperty({ description: '생성 일시' })
  createdAt: Date;
}
