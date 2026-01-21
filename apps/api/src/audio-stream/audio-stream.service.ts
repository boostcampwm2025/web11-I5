import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { createWriteStream, WriteStream } from 'fs';
import { promises as fs } from 'fs';
import * as path from 'path';
import { AudioAsset, AudioUploadStatus } from './entities/audio-asset.entity';
import { AudioSessionStatus } from './audio-stream.constants';
import { ObjectStorageService } from '../object-storage/object-storage.service';
import { AudioUploadCompletedEvent } from './events/audio-upload-completed.event';

/**
 * 인메모리 세션 정보
 * MVP: 서버 재시작 시 세션 정보 손실됨 (RDB/Redis 미사용)
 */
interface AudioSession {
  userId: number;
  sessionId: string;
  status: AudioSessionStatus;
  lastSeq: number;
  localDirPath: string;
  filePath: string; // 최종 파일 경로
  writeStream: WriteStream; // 청크를 append할 스트림
  codec: string;
  sampleRate: number;
  channels: number;
  createdAt: Date;
}

@Injectable()
export class AudioStreamService {
  private readonly logger = new Logger(AudioStreamService.name);

  constructor(
    @InjectRepository(AudioAsset)
    private readonly audioAssetRepository: Repository<AudioAsset>,
    private readonly objectStorageService: ObjectStorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * MVP: 인메모리 세션 저장소
   * 서버 재시작 시 모든 세션 정보 손실
   */
  private readonly sessions = new Map<string, AudioSession>();

  /**
   * 오디오 세션 저장 루트 디렉토리
   * MVP: 로컬 디스크 사용 (Object Storage 미연동)
   */
  private readonly audioRootDir = '/tmp/audio_sessions';

  /**
   * 오디오 스트리밍 시작
   * 새로운 세션을 생성하고 로컬 디렉토리 및 writeStream을 준비한다.
   */
  async startSession(
    userId: number,
    codec: string,
    sampleRate: number,
    channels: number,
  ): Promise<string> {
    const sessionId = randomUUID();
    const localDirPath = path.join(this.audioRootDir, sessionId);

    // 로컬 디렉토리 생성
    await fs.mkdir(localDirPath, { recursive: true });

    // 최종 파일 경로 및 writeStream 생성
    const filePath = path.join(localDirPath, `${sessionId}.wav`);
    const writeStream = createWriteStream(filePath, { flags: 'a' });

    const session: AudioSession = {
      userId,
      sessionId,
      status: AudioSessionStatus.OPEN,
      lastSeq: 0,
      localDirPath,
      filePath,
      writeStream,
      codec,
      sampleRate,
      channels,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    this.logger.log(`Session started: ${sessionId} at ${localDirPath}`);

    return sessionId;
  }

  /**
   * 오디오 청크 저장
   * MVP: seq 중복/역순 체크는 최소 수준 (단순 비교만)
   */
  async saveChunk(
    sessionId: string,
    seq: number,
    bytes: Buffer,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== AudioSessionStatus.OPEN) {
      throw new Error(
        `Session is not open: ${sessionId} (status: ${session.status})`,
      );
    }

    // MVP: 간단한 seq 검증 (역순/중복 거부)
    if (seq <= session.lastSeq) {
      this.logger.warn(
        `Invalid seq: ${seq} (last: ${session.lastSeq}) for session ${sessionId}`,
      );
      // MVP: 에러를 던지지 않고 무시
      return;
    }

    // writeStream에 append
    return new Promise((resolve, reject) => {
      session.writeStream.write(bytes, (error) => {
        if (error) {
          this.logger.error(
            `Failed to write chunk: session=${sessionId}, seq=${seq}`,
            error,
          );
          reject(error);
        } else {
          // 세션 정보 업데이트
          session.lastSeq = seq;

          resolve();
        }
      });
    });
  }

  /**
   * 오디오 스트리밍 종료
   * writeStream을 닫고 AudioAsset을 DB에 저장한 후 최종 파일 정보를 반환한다.
   */
  async finalizeSession(
    sessionId: string,
    userId: number, // MVP: 인증/인가는 Gateway에서 처리되었다고 가정
  ): Promise<{ filePath: string; fileName: string; assetId: number }> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== AudioSessionStatus.OPEN) {
      throw new Error(
        `Session is not open: ${sessionId} (status: ${session.status})`,
      );
    }

    // writeStream 닫기
    await new Promise<void>((resolve, reject) => {
      session.writeStream.end((error?: Error) => {
        if (error) {
          this.logger.error(
            `Failed to close stream: session=${sessionId}`,
            error,
          );
          reject(
            error instanceof Error
              ? error
              : new Error('Failed to close stream'),
          );
        } else {
          resolve();
        }
      });
    });

    // PCM 데이터 크기 확인
    const stats = await fs.stat(session.filePath);
    const pcmDataSize = stats.size;

    // WAV 헤더 생성
    const wavHeader = createWavHeader(
      session.sampleRate,
      session.channels,
      pcmDataSize,
    );

    // 임시 파일로 PCM 데이터 읽기
    const pcmData = await fs.readFile(session.filePath);

    // WAV 헤더 + PCM 데이터로 최종 파일 작성
    await fs.writeFile(session.filePath, Buffer.concat([wavHeader, pcmData]));

    // 최종 파일 크기 확인
    const finalStats = await fs.stat(session.filePath);
    const byteSize = finalStats.size;

    const fileName = path.basename(session.filePath);

    // AudioAsset을 먼저 pending 상태로 생성
    const audioAsset = this.audioAssetRepository.create({
      userId,
      storageUrl: session.filePath, // 초기에는 로컬 경로
      objectKey: null,
      uploadStatus: AudioUploadStatus.PENDING,
      durationMs: null,
      byteSize: byteSize.toString(),
      codec: session.codec,
      sampleRate: session.sampleRate,
      channels: session.channels,
    });

    const savedAsset = await this.audioAssetRepository.save(audioAsset);

    this.logger.log(
      `Session finalized: ${sessionId}, file: ${session.filePath}, asset_id: ${savedAsset.id}`,
    );

    this.sessions.delete(sessionId);

    // Object Storage 업로드를 비동기로 실행 (await 하지 않음)
    void this.uploadToStorageAsync(
      savedAsset.id,
      session.filePath,
      sessionId,
      fileName,
    );

    return {
      filePath: session.filePath,
      fileName,
      assetId: savedAsset.id,
    };
  }

  /**
   * Object Storage에 비동기로 업로드하고 DB 상태를 업데이트한다.
   */
  private async uploadToStorageAsync(
    assetId: number,
    localFilePath: string,
    sessionId: string,
    fileName: string,
  ): Promise<void> {
    try {
      const uploadKey = `audio-sessions/${sessionId}/${fileName}`;
      const storageUrl = await this.objectStorageService.uploadFile(
        localFilePath,
        uploadKey,
      );

      this.logger.log(
        `File uploaded to Object Storage: ${localFilePath} -> ${storageUrl}`,
      );

      // 업로드 성공 시 DB 업데이트
      await this.audioAssetRepository.update(assetId, {
        storageUrl,
        objectKey: uploadKey,
        uploadStatus: AudioUploadStatus.COMPLETED,
      });

      // 업로드 완료 이벤트 발행
      try {
        this.eventEmitter.emit(
          'audio.upload.completed',
          new AudioUploadCompletedEvent(assetId),
        );
        this.logger.log(
          `Emitted audio.upload.completed event for assetId: ${assetId}`,
        );
      } catch (emitError) {
        this.logger.error(
          `Failed to emit audio.upload.completed event for assetId: ${assetId}`,
          emitError,
        );
      }

      // 로컬 파일 삭제
      try {
        await fs.unlink(localFilePath);
        this.logger.log(`Local file deleted: ${localFilePath}`);
      } catch (deleteError) {
        this.logger.warn(
          `Failed to delete local file: ${localFilePath}`,
          deleteError,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to upload file to Object Storage: ${localFilePath}`,
        error,
      );

      // 업로드 실패 시 DB 상태 업데이트
      try {
        await this.audioAssetRepository.update(assetId, {
          uploadStatus: AudioUploadStatus.FAILED,
        });
      } catch (updateError) {
        this.logger.error(
          `Failed to update upload status to FAILED for assetId: ${assetId}`,
          updateError,
        );
      }
    }
  }

  /**
   * Audio Asset을 ID로 찾는다.
   * @param assetId Audio Asset Id
   * @returns  Audio Asset
   */
  async findAudioAsset(assetId: number) {
    return this.audioAssetRepository.findOneBy({ id: assetId });
  }
}

/**
 * WAV 파일 헤더 생성
 * PCM16 포맷 기준
 */
function createWavHeader(
  sampleRate: number,
  channels: number,
  dataSize: number,
): Buffer {
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4); // ChunkSize
  header.write('WAVE', 8);

  // fmt sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(channels, 22); // NumChannels
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(sampleRate * channels * 2, 28); // ByteRate
  header.writeUInt16LE(channels * 2, 32); // BlockAlign
  header.writeUInt16LE(16, 34); // BitsPerSample

  // data sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40); // Subchunk2Size

  return header;
}
