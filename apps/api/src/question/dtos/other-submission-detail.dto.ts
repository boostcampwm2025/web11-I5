import { ApiProperty } from '@nestjs/swagger';
import { AnswerSubmissionResponseDto } from 'src/answer-submission/dtos/answer-submission-response.dto';
import { QuestionInfoDto } from './question-info.dto';

export class OtherSubmissionDetailDto {
  @ApiProperty({ description: '답변 작성자 닉네임', example: 'user_1010' })
  nickname: string;

  @ApiProperty({
    description: '문제 정보',
    type: QuestionInfoDto,
  })
  question: QuestionInfoDto;

  @ApiProperty({
    description: '제출 정보 (답변 내용, 제출 시각, 총점 등)',
    type: AnswerSubmissionResponseDto,
  })
  submission: AnswerSubmissionResponseDto;

  @ApiProperty({
    description: '핵심 키워드 목록',
    type: [String],
    example: ['Speed', 'Streaming', 'Stateless'],
  })
  keywords: string[];
}
