import { ApiProperty } from '@nestjs/swagger';

export class RecordDailyActivityResponseDto {
  @ApiProperty({
    description: '기록 성공 여부',
    example: true,
  })
  success: boolean;
}
