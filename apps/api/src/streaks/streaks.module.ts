import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Streaks } from './entities/streaks.entity';
import { StreaksController } from './streaks.controller';
import { StreaksService } from './streaks.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Streaks]), AuthModule],
  controllers: [StreaksController],
  providers: [StreaksService],
  exports: [StreaksService],
})
export class StreaksModule {}
