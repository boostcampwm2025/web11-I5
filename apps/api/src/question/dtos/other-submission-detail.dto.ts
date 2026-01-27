import { ApiProperty } from '@nestjs/swagger';
import { AnswerSubmissionResponseDto } from 'src/answer-submission/dtos/answer-submission-response.dto';

export class OtherSubmissionDetailDto {
  @ApiProperty({ description: '답변 작성자 닉네임', example: 'user_1010' })
  nickname: string;

  @ApiProperty({
    description: '제출 정보 (답변 내용, 제출 시각, 총점 등)',
    type: AnswerSubmissionResponseDto,
  })
  submission: AnswerSubmissionResponseDto;
}
