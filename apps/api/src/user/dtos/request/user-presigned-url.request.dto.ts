import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export class UserPresignedUrlRequestDto {
  @ApiProperty({
    description: '이미지 Content-Type',
    example: 'image/jpeg',
    enum: ALLOWED_IMAGE_TYPES,
  })
  @IsString()
  @IsIn(ALLOWED_IMAGE_TYPES)
  contentType: string;
}
