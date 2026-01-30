import {
  Body,
  Controller,
  Post,
  Query,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SttResult } from './dtos/stt-result.dto';
import { AnswerSubmissionService } from '../answer-submission/answer-submission.service';
import { AnswerEvaluationService } from 'src/answer-evaluation/answer-evaluation.service';
import { LlmService } from 'src/llm/llm.service';
import { LLM_MODELS } from 'src/llm/llm.constants';
import { STT_POST_PROCESSING_SYSTEM_PROMPT } from 'src/llm/prompts/stt-post-processing.prompt';
import { STT_POST_PROCESSING_SCHEMA } from 'src/llm/prompts/stt-post-processing.schema';

@ApiTags('stt')
@Controller('stt')
export class SttController {
  private readonly logger = new Logger(SttController.name);
  private readonly sttPostProcessingModel: string;

  constructor(
    private readonly answerSubmissionService: AnswerSubmissionService,
    private readonly answerEvaluationService: AnswerEvaluationService,
    private readonly llmService: LlmService,
    private readonly configService: ConfigService,
  ) {
    this.sttPostProcessingModel =
      this.configService.get<string>('GEMINI_STT_POST_PROCESSING_MODEL') ||
      LLM_MODELS.EVALUATION;
  }

  @Post('callback')
  @ApiOperation({
    summary: 'STT 결과 콜백',
    description:
      'Naver Clova Speech API로부터 STT 처리 결과를 받아 답변 제출 레코드를 업데이트합니다. audioAssetId를 쿼리 파라미터로 받아 해당 오디오 에셋과 연결된 답변의 STT 상태와 텍스트를 업데이트합니다.',
  })
  @ApiQuery({
    name: 'audioAssetId',
    description: '오디오 에셋 ID',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'STT 결과가 성공적으로 처리됨',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'audioAssetId가 누락되었거나 유효하지 않음',
  })
  sttResultCallback(
    @Query('audioAssetId', ParseIntPipe) audioAssetId: number,
    @Body() data: SttResult,
  ) {
    this.logger.log(`Received STT callback for audioAssetId: ${audioAssetId}`);
    this.logger.log(`STT Result: ${data.result}`);

    // 즉시 응답하고, 후처리는 비동기로 실행
    this.processCallback(audioAssetId, data).catch((error) => {
      this.logger.error(
        `Failed to process STT callback for audioAssetId: ${audioAssetId}`,
        error,
      );
    });

    return { success: true };
  }

  private async processCallback(
    audioAssetId: number,
    data: SttResult,
  ): Promise<void> {
    const isSuccess = data.result === 'SUCCEEDED';
    const sttText = data.text || '';

    this.logger.log(
      `Original STT text for audioAssetId ${audioAssetId}: ${sttText}`,
    );

    // LLM 후처리 시도, 실패 시 원본 텍스트로 폴백
    let finalText = sttText;
    let usedFallback = false;

    try {
      const postProcessedSttText = await this.llmService.callWithSchema<{
        postProcessed: string;
      }>(
        STT_POST_PROCESSING_SYSTEM_PROMPT,
        sttText,
        STT_POST_PROCESSING_SCHEMA,
        { model: this.sttPostProcessingModel },
      );

      if (postProcessedSttText.postProcessed) {
        finalText = postProcessedSttText.postProcessed;
        this.logger.log(
          `Post-processed text for audioAssetId ${audioAssetId}: ${finalText}`,
        );
      } else {
        usedFallback = true;
        this.logger.warn(
          `LLM returned empty post-processed text for audioAssetId ${audioAssetId}, using original STT text`,
        );
      }
    } catch (error) {
      usedFallback = true;
      this.logger.error(
        `LLM post-processing failed for audioAssetId ${audioAssetId}, using original STT text as fallback`,
        error,
      );
    }

    // 원본 또는 후처리된 텍스트로 제출 업데이트 (데이터 손실 방지)
    const submission = await this.answerSubmissionService.updateSttResult(
      audioAssetId,
      finalText,
      isSuccess,
    );

    this.logger.log(
      `Successfully updated answer submission for audioAssetId: ${audioAssetId}` +
        (usedFallback ? ' (with fallback to original STT)' : ''),
    );

    if (isSuccess) {
      await this.answerEvaluationService.evaluate(submission.id);
    }
  }
}
