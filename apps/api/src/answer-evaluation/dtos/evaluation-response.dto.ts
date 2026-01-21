import { ApiProperty } from '@nestjs/swagger';
import {
  AccuracyEval,
  LogicEval,
  DepthEval,
} from '../answer-evaluation.constants';

class ScoreDetailsDto {
  @ApiProperty({ description: '정확성 점수', example: 35 })
  accuracy: number;

  @ApiProperty({ description: '논리성 점수', example: 30 })
  logic: number;

  @ApiProperty({ description: '심층성 점수', example: 10 })
  depth: number;

  @ApiProperty({ description: '완전성 점수', example: 5 })
  completeness: number;

  @ApiProperty({ description: '적용성 점수', example: 5 })
  application: number;
}

class DetailAnalysisDto {
  @ApiProperty({
    description: '정확성 분석 멘트',
    example: '핵심 개념이 정확합니다.',
  })
  accuracy: string;

  @ApiProperty({
    description: '논리성 분석 멘트',
    example: '구조가 탄탄합니다.',
  })
  logic: string;

  @ApiProperty({
    description: '심층성 분석 멘트',
    example: '심화 내용이 부족합니다.',
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
    description: '정확성 등급',
    enum: AccuracyEval,
    example: AccuracyEval.PERFECT,
    nullable: true,
  })
  accuracyEval: AccuracyEval;

  @ApiProperty({
    description: '논리성 등급',
    enum: LogicEval,
    example: LogicEval.COHERENT,
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

  @ApiProperty({ description: '실무 적용 여부', example: false })
  hasApplication: boolean;

  @ApiProperty({ description: '완전한 문장 여부', example: true })
  isCompleteSentence: boolean;

  @ApiProperty({ description: '생성 일시' })
  createdAt: Date;
}
