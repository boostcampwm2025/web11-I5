import { Controller, Post, Body, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserId } from 'src/auth/decorators/user-id.decorator';
import { UploadsService } from './uploads.service';
import {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
  UploadCompleteRequestDto,
  UploadCompleteResponseDto,
} from './dtos';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * POST /uploads/presigned-url
   * Presigned PUT URL을 발급하고 PENDING 상태의 AudioAsset을 생성한다.
   */
  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Presigned PUT URL 발급' })
  @ApiBody({ type: PresignedUrlRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Presigned URL 발급 성공',
    type: PresignedUrlResponseDto,
  })
  async requestPresignedUrl(
    @UserId() userId: number,
    @Body() dto: PresignedUrlRequestDto,
  ): Promise<PresignedUrlResponseDto> {
    this.logger.log(
      `POST /uploads/presigned-url: userId=${userId}, codec=${dto.codec}`,
    );

    return this.uploadsService.requestPresignedUrl(userId, dto);
  }

  /**
   * POST /uploads/complete
   * 클라이언트가 Object Storage에 업로드를 완료한 후 호출하여 검증 및 DB 확정한다.
   */
  @Post('complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업로드 완료 확인' })
  @ApiBody({ type: UploadCompleteRequestDto })
  @ApiResponse({
    status: 200,
    description: '업로드 완료 확인 성공',
    type: UploadCompleteResponseDto,
  })
  async confirmUpload(
    @UserId() userId: number,
    @Body() dto: UploadCompleteRequestDto,
  ): Promise<UploadCompleteResponseDto> {
    this.logger.log(
      `POST /uploads/complete: userId=${userId}, assetId=${dto.assetId}`,
    );

    return this.uploadsService.confirmUpload(userId, dto);
  }
}
