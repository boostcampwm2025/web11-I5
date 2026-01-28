import { ApiProperty } from '@nestjs/swagger';

export class UserPresignedUrlResponseDto {
  @ApiProperty({ description: '업로드용 Presigned PUT URL' })
  uploadUrl: string;

  @ApiProperty({ description: 'Object Storage 키' })
  objectKey: string;

  @ApiProperty({ description: 'URL 만료 시간 (초)' })
  expiresIn: number;
}
