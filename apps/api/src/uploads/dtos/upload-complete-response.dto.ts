import { ApiProperty } from '@nestjs/swagger';
import { AudioUploadStatus } from '../entities/audio-asset.entity';

export class UploadCompleteResponseDto {
  @ApiProperty({ description: 'Audio Asset ID' })
  assetId: number;

  @ApiProperty({ description: 'Object Storage URL' })
  storageUrl: string;

  @ApiProperty({ description: '업로드 상태', enum: AudioUploadStatus })
  uploadStatus: AudioUploadStatus;
}
