import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioStreamGateway } from './audio-stream.gateway';
import { AudioStreamController } from './audio-stream.controller';
import { AudioStreamService } from './audio-stream.service';
import { AudioAsset } from './entities/audio-asset.entity';
import { ObjectStorageModule } from '../object-storage/object-storage.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AudioAsset]),
    ObjectStorageModule,
    AuthModule,
  ],
  controllers: [AudioStreamController],
  providers: [AudioStreamGateway, AudioStreamService],
  exports: [AudioStreamService, TypeOrmModule],
})
export class AudioStreamModule {}
