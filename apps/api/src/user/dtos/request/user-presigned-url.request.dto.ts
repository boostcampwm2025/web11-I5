import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserPresignedUrlRequestDto {
  @ApiProperty({
    description: '이미지 Content-Type',
    example: 'image/jpeg',
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  })
  @IsString()
  contentType: string;
}
