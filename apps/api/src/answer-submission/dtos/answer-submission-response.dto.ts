import { ApiProperty } from '@nestjs/swagger';
import { EvaluationStatus, InputType, ProcessStatus } from '@repo/types';

export class AnswerSubmissionResponseDto {
  @ApiProperty({ description: '제출 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '문제 ID', example: 10 })
  questionId: number;

  @ApiProperty({ description: '제출 일시' })
  submittedAt: Date;

  @ApiProperty({ description: '오디오 파일 ID', example: 123 })
  audioAssetId: number | null;

  @ApiProperty({
    description: '채점 상태',
    enum: EvaluationStatus,
    example: EvaluationStatus.PENDING,
  })
  evaluationStatus: EvaluationStatus;

  @ApiProperty({
    description: 'STT 변환 상태',
    enum: ProcessStatus,
    example: ProcessStatus.DONE,
  })
  sttStatus: ProcessStatus;

  @ApiProperty({
    description: '입력 방식',
    enum: InputType,
    example: InputType.VOICE,
  })
  inputType: InputType;

  @ApiProperty({
    description: '답변 내용 (STT 결과 또는 텍스트)',
    example: 'This is my answer.',
  })
  answerContent: string;

  @ApiProperty({ description: '총점', example: 85 })
  totalScore: number;

  @ApiProperty({ description: '소요 시간 (초)', example: 45 })
  duration: number;
}
