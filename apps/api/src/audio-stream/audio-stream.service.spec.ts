/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

jest.mock('fs', () => {
  // ✅ 원본 fs는 유지(= fs.native 유지)하면서 createWriteStream만 mock
  const actual = jest.requireActual<typeof import('fs')>('fs');
  return {
    ...actual,
    createWriteStream: jest.fn(),
  };
});

jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AudioStreamService } from './audio-stream.service';
import { AudioAsset, AudioUploadStatus } from './entities/audio-asset.entity';
import { ObjectStorageService } from '../object-storage/object-storage.service';
import { AudioSessionStatus } from './audio-stream.constants';

import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { createWriteStream } from 'fs';

describe('AudioStreamService - Unit Tests (TestingModule, fs partial mock)', () => {
  let moduleRef: TestingModule;
  let service: AudioStreamService;

  const repoMock = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findOneBy: jest.fn(),
  };

  const objectStorageMock = {
    uploadFile: jest.fn(),
  };

  const eventEmitterMock = { emit: jest.fn() };

  const writeStreamMock = {
    write: jest.fn((_: any, cb: (err?: Error | null) => void) => cb(null)),
    end: jest.fn((cb: (err?: Error | null) => void) => cb(null)),
  } as any;

  const FIXED_SESSION_ID = 'session-uuid-1';
  const USER_ID = 7;

  let mkdirSpy: jest.SpyInstance;
  let statSpy: jest.SpyInstance;
  let readFileSpy: jest.SpyInstance;
  let writeFileSpy: jest.SpyInstance;
  let unlinkSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    (randomUUID as unknown as jest.Mock).mockReturnValue(FIXED_SESSION_ID);

    // ✅ createWriteStream은 spyOn 대신 jest.mock('fs')로 만든 mock 함수에 직접 주입
    (createWriteStream as unknown as jest.Mock).mockReturnValue(
      writeStreamMock,
    );

    // ✅ fs.promises는 원본을 유지하므로 spyOn 가능
    mkdirSpy = jest
      .spyOn(fs.promises, 'mkdir')
      .mockResolvedValue(undefined as any);

    statSpy = jest
      .spyOn(fs.promises, 'stat')
      .mockResolvedValueOnce({ size: 1000 } as any) // pcmDataSize
      .mockResolvedValueOnce({ size: 1044 } as any); // final byteSize (44 + 1000)

    readFileSpy = jest
      .spyOn(fs.promises, 'readFile')
      .mockResolvedValue(Buffer.from('pcmdata') as any);

    writeFileSpy = jest
      .spyOn(fs.promises, 'writeFile')
      .mockResolvedValue(undefined as any);

    unlinkSpy = jest
      .spyOn(fs.promises, 'unlink')
      .mockResolvedValue(undefined as any);

    repoMock.create.mockImplementation((dto: any) => dto);
    repoMock.save.mockResolvedValue({ id: 123 });

    moduleRef = await Test.createTestingModule({
      providers: [
        AudioStreamService,
        { provide: getRepositoryToken(AudioAsset), useValue: repoMock },
        { provide: ObjectStorageService, useValue: objectStorageMock },
        { provide: EventEmitter2, useValue: eventEmitterMock },
      ],
    }).compile();

    service = moduleRef.get(AudioStreamService);
  });

  afterEach(async () => {
    mkdirSpy.mockRestore();
    statSpy.mockRestore();
    readFileSpy.mockRestore();
    writeFileSpy.mockRestore();
    unlinkSpy.mockRestore();

    await moduleRef.close();
  });

  describe('오디오 스트리밍 시작', () => {
    it('오디오 스트리밍 시작 시 세션이 생긴다', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      expect(sessionId).toBe(FIXED_SESSION_ID);
      expect(mkdirSpy).toHaveBeenCalledTimes(1);
      expect(createWriteStream).toHaveBeenCalledTimes(1);

      const sessions = (service as any).sessions as Map<string, any>;
      expect(sessions.has(sessionId)).toBe(true);
    });

    it('오디오 스트리밍 시작 시 새로 생긴 세션의 상태는 OPEN이다.', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      const sessions = (service as any).sessions as Map<string, any>;
      const session = sessions.get(sessionId);

      expect(session.status).toBe(AudioSessionStatus.OPEN);
      expect(session.lastSeq).toBe(0);
      expect(session.codec).toBe('pcm');
      expect(session.sampleRate).toBe(16000);
      expect(session.channels).toBe(1);
    });
  });

  describe('오디오 청크 저장', () => {
    it('열린 스트리밍 세션에 오디오 청크 저장을 할 수 있다.', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      const buf = Buffer.from([1, 2, 3]);
      await service.saveChunk(sessionId, 1, buf);

      expect(writeStreamMock.write).toHaveBeenCalledTimes(1);
      expect(writeStreamMock.write).toHaveBeenCalledWith(
        buf,
        expect.any(Function),
      );

      const sessions = (service as any).sessions as Map<string, any>;
      expect(sessions.get(sessionId).lastSeq).toBe(1);
    });

    it('닫힌 스트리밍 세션에 오디오 청크 저장할 시 에러가 발생한다.', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      const sessions = (service as any).sessions as Map<string, any>;
      sessions.get(sessionId).status = AudioSessionStatus.FINALIZED;

      await expect(
        service.saveChunk(sessionId, 1, Buffer.from([9])),
      ).rejects.toThrow(/Session is not open/);

      expect(writeStreamMock.write).not.toHaveBeenCalled();
    });

    it('오디오 청크가 올바른 순서에 맞게 저장된다.', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      await service.saveChunk(sessionId, 1, Buffer.from([1]));
      await service.saveChunk(sessionId, 2, Buffer.from([2]));
      await service.saveChunk(sessionId, 3, Buffer.from([3]));

      expect(writeStreamMock.write).toHaveBeenCalledTimes(3);

      const sessions = (service as any).sessions as Map<string, any>;
      expect(sessions.get(sessionId).lastSeq).toBe(3);
    });

    it('오디오 청크를 잘못된 순서로 저장하려고 할 시 (현재 구현 기준) 무시된다.', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      await service.saveChunk(sessionId, 2, Buffer.from([2])); // OK
      await service.saveChunk(sessionId, 2, Buffer.from([9])); // duplicate -> ignore
      await service.saveChunk(sessionId, 1, Buffer.from([1])); // out-of-order -> ignore

      expect(writeStreamMock.write).toHaveBeenCalledTimes(1);

      const sessions = (service as any).sessions as Map<string, any>;
      expect(sessions.get(sessionId).lastSeq).toBe(2);
    });
  });

  describe('오디오 스트리밍 종료', () => {
    it('오디오 스트리밍 세션 종료 시 세션이 제거된다.', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      jest
        .spyOn(service as any, 'uploadToStorageAsync')
        .mockResolvedValue(undefined);

      await service.finalizeSession(sessionId, USER_ID);

      const sessions = (service as any).sessions as Map<string, any>;
      expect(sessions.has(sessionId)).toBe(false);
    });

    it('OPEN 상태가 아닌 스트리밍 세션을 종료하려고 하면 에러가 발생한다.', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      const sessions = (service as any).sessions as Map<string, any>;
      sessions.get(sessionId).status = AudioSessionStatus.FINALIZED;

      await expect(service.finalizeSession(sessionId, USER_ID)).rejects.toThrow(
        /Session is not open/,
      );
    });

    it('오디오 스트리밍 세션 종료 시 오디오 에셋이 생성된다.', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      jest
        .spyOn(service as any, 'uploadToStorageAsync')
        .mockResolvedValue(undefined);

      const result = await service.finalizeSession(sessionId, USER_ID);

      expect(writeStreamMock.end).toHaveBeenCalledTimes(1);

      expect(statSpy).toHaveBeenCalledTimes(2);
      expect(readFileSpy).toHaveBeenCalledTimes(1);
      expect(writeFileSpy).toHaveBeenCalledTimes(1);

      expect(repoMock.create).toHaveBeenCalledTimes(1);
      expect(repoMock.save).toHaveBeenCalledTimes(1);

      const dto = repoMock.create.mock.calls[0][0];
      expect(dto.userId).toBe(USER_ID);
      expect(dto.uploadStatus).toBe(AudioUploadStatus.PENDING);
      expect(dto.byteSize).toBe('1044');
      expect(dto.codec).toBe('pcm');
      expect(dto.sampleRate).toBe(16000);
      expect(dto.channels).toBe(1);

      expect(result.assetId).toBe(123);
      expect(result.fileName).toBe(`${FIXED_SESSION_ID}.wav`);
      expect(result.filePath).toContain(
        `/tmp/audio_sessions/${FIXED_SESSION_ID}/`,
      );
    });

    it('오디오 스트리밍 세션 종료 시 Object Storage 업로드가 시작된다.', async () => {
      const sessionId = await service.startSession('pcm', 16000, 1);

      const uploadSpy = jest
        .spyOn(service as any, 'uploadToStorageAsync')
        .mockResolvedValue(undefined);

      await service.finalizeSession(sessionId, USER_ID);

      expect(uploadSpy).toHaveBeenCalledTimes(1);

      const [assetId, localFilePath, calledSessionId, fileName] =
        uploadSpy.mock.calls[0];

      expect(assetId).toBe(123);
      expect(calledSessionId).toBe(FIXED_SESSION_ID);
      expect(fileName).toBe(`${FIXED_SESSION_ID}.wav`);
      expect(localFilePath).toContain(
        `/tmp/audio_sessions/${FIXED_SESSION_ID}/`,
      );
    });
  });
});
