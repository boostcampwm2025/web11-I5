import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AnswerEvaluationService } from './answer-evaluation.service';
import { CreateEvaluationDto } from './dtos/create-evaluation.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EvaluationResponseDto } from './dtos/evaluation-response.dto';

@ApiTags('answer-evaluation')
@Controller('answer-evaluation')
export class AnswerEvaluationController {
  constructor(
    private readonly answerEvaluationService: AnswerEvaluationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: '답변 평가 요청',
    description:
      '제출된 답안(submissionId)에 대해 AI 평가를 시작합니다. 평가 상태를 PENDING으로 변경하고 비동기로 채점을 진행합니다. 결과는 별도로 조회해야 합니다.',
  })
  @ApiBody({ type: CreateEvaluationDto })
  @ApiResponse({
    status: 202,
    description:
      '평가 요청 접수됨 (비동기 처리). 결과는 submission 상태 조회로 확인하세요.',
    schema: {
      example: {
        submissionId: 123,
        message:
          '채점 요청이 접수되었습니다. 결과는 제출 상태를 통해 확인해주세요.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      '대상을 찾을 수 없음: 저장된 답안(submission)이 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 409,
    description: '충돌: 이미 채점이 완료된 답안입니다.',
  })
  async create(@Body() createEvaluationDto: CreateEvaluationDto) {
    await this.answerEvaluationService.evaluate(
      createEvaluationDto.submissionId,
    );

    return {
      submissionId: createEvaluationDto.submissionId,
      message:
        '채점 요청이 접수되었습니다. 결과는 제출 상태를 통해 확인해주세요.',
    };
  }

  @ApiOperation({
    summary: '평가 상세 조회',
    description:
      '제출 ID(submissionId)를 통해 AI의 상세 분석 결과와 점수를 조회합니다.',
  })
  @ApiParam({
    name: 'submissionId',
    description: '제출 ID (submission ID)',
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: '평가 조회 성공',
    type: EvaluationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '해당 평가 결과를 찾을 수 없습니다.',
  })
  @Get(':submissionId')
  async getEvaluationBySubmissionId(
    @Param('submissionId', ParseIntPipe) submissionId: number,
  ) {
    return await this.answerEvaluationService.getEvaluationBySubmissionId(
      submissionId,
    );
  }
}
