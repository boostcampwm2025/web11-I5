import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';

const mockGetSignedUrlPromise = jest.fn();
const mockHeadObject = jest.fn();
const mockDeleteObject = jest.fn();

// aws-sdk 모듈 전체 모킹 (생성자에서 new AWS.S3, new AWS.Endpoint 사용)
jest.mock('aws-sdk', () => {
  function MockEndpoint(this: { host: string }, host: string) {
    this.host = host;
  }
  return {
    __esModule: true,
    default: {
      S3: jest.fn().mockImplementation(() => ({
        getSignedUrlPromise: mockGetSignedUrlPromise,
        headObject: jest.fn().mockReturnValue({ promise: mockHeadObject }),
        deleteObject: jest.fn().mockReturnValue({ promise: mockDeleteObject }),
      })),
      Endpoint: MockEndpoint,
    },
  };
});

describe('ObjectStorageService', () => {
  let service: ObjectStorageService;

  const createModule = (config: Record<string, string | undefined>) => {
    return Test.createTestingModule({
      providers: [
        ObjectStorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => config[key]),
          },
        },
        {
          provide: Logger,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('설정이 완료된 경우', () => {
    beforeEach(async () => {
      const module = await createModule({
        NCLOUD_OBJECT_STORAGE_ENDPOINT: 'https://kr.object.ncloudstorage.com',
        NCLOUD_OBJECT_STORAGE_REGION: 'kr-standard',
        NCLOUD_OBJECT_STORAGE_ACCESS_KEY: 'access',
        NCLOUD_OBJECT_STORAGE_SECRET_KEY: 'secret',
        NCLOUD_OBJECT_STORAGE_BUCKET: 'my-bucket',
        CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
      });
      service = module.get<ObjectStorageService>(ObjectStorageService);
    });

    describe('createPresignedPutUrl', () => {
      it('objectKey로 Presigned PUT URL을 반환해야 한다', async () => {
        const objectKey = 'audio/test.wav';
        const expectedUrl = 'https://signed-url.example/put';

        mockGetSignedUrlPromise.mockResolvedValue(expectedUrl);

        const result = await service.createPresignedPutUrl(objectKey);

        expect(mockGetSignedUrlPromise).toHaveBeenCalledWith('putObject', {
          Bucket: 'my-bucket',
          Key: objectKey,
          ContentType: 'audio/wav',
          Expires: 600,
        });
        expect(result.uploadUrl).toBe(expectedUrl);
        expect(result.expiresIn).toBe(600);
      });

      it('objectKey가 비어 있으면 Error를 발생시켜야 한다', async () => {
        await expect(service.createPresignedPutUrl('')).rejects.toThrow(
          'objectKey is required',
        );
        await expect(service.createPresignedPutUrl('   ')).rejects.toThrow(
          'objectKey is required',
        );
      });

      it('expiresIn이 0 이하면 Error를 발생시켜야 한다', async () => {
        mockGetSignedUrlPromise.mockResolvedValue('url');

        await expect(
          service.createPresignedPutUrl('key', 'audio/wav', 0),
        ).rejects.toThrow('expiresIn must be a positive number');
      });
    });

    describe('verifyFileExists', () => {
      it('파일이 존재하면 exists true와 메타데이터를 반환해야 한다', async () => {
        const objectKey = 'audio/exists.wav';
        mockHeadObject.mockResolvedValue({
          ContentLength: 1024,
          ContentType: 'audio/wav',
        });

        const result = await service.verifyFileExists(objectKey);

        expect(result.exists).toBe(true);
        expect(result.contentLength).toBe(1024);
        expect(result.contentType).toBe('audio/wav');
      });

      it('파일이 없으면(404) exists false를 반환해야 한다', async () => {
        const objectKey = 'audio/notfound.wav';
        mockHeadObject.mockRejectedValue({ statusCode: 404 });

        const result = await service.verifyFileExists(objectKey);

        expect(result.exists).toBe(false);
      });

      it('objectKey가 비어 있으면 Error를 발생시켜야 한다', async () => {
        await expect(service.verifyFileExists('')).rejects.toThrow(
          'objectKey is required',
        );
      });
    });

    describe('getPublicUrl', () => {
      it('objectKey로 공개 URL을 반환해야 한다', () => {
        const objectKey = 'audio/public.wav';

        const result = service.getPublicUrl(objectKey);

        expect(result).toBe(
          'https://kr.object.ncloudstorage.com/my-bucket/audio/public.wav',
        );
      });
    });

    describe('createPresignedGetUrl', () => {
      it('objectKey로 Presigned GET URL을 반환해야 한다', async () => {
        const objectKey = 'audio/get.wav';
        const expectedUrl = 'https://signed-url.example/get';

        mockGetSignedUrlPromise.mockResolvedValue(expectedUrl);

        const result = await service.createPresignedGetUrl(objectKey);

        expect(mockGetSignedUrlPromise).toHaveBeenCalledWith('getObject', {
          Bucket: 'my-bucket',
          Key: objectKey,
        });
        expect(result).toBe(expectedUrl);
      });

      it('objectKey가 비어 있으면 Error를 발생시켜야 한다', async () => {
        await expect(service.createPresignedGetUrl('')).rejects.toThrow(
          'objectKey is required',
        );
      });
    });

    describe('deleteObject', () => {
      it('objectKey에 해당하는 객체를 삭제해야 한다', async () => {
        const objectKey = 'audio/delete.wav';
        mockDeleteObject.mockResolvedValue(undefined);

        await service.deleteObject(objectKey);

        expect(mockDeleteObject).toHaveBeenCalled();
      });

      it('objectKey가 비어 있으면 Error를 발생시켜야 한다', async () => {
        await expect(service.deleteObject('')).rejects.toThrow(
          'objectKey is required',
        );
      });
    });
  });
});
