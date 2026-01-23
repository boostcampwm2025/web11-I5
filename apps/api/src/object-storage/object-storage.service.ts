import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AWS from 'aws-sdk';

@Injectable()
export class ObjectStorageService implements OnModuleInit {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly s3Client: AWS.S3 | null = null;
  private readonly bucket: string;
  private readonly allowedOrigins: string[];

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>(
      'NCLOUD_OBJECT_STORAGE_ENDPOINT',
    );
    const region = this.configService.get<string>(
      'NCLOUD_OBJECT_STORAGE_REGION',
    );
    const accessKeyId = this.configService.get<string>(
      'NCLOUD_OBJECT_STORAGE_ACCESS_KEY',
    );
    const secretAccessKey = this.configService.get<string>(
      'NCLOUD_OBJECT_STORAGE_SECRET_KEY',
    );
    this.bucket = this.configService.get<string>(
      'NCLOUD_OBJECT_STORAGE_BUCKET',
    )!;

    if (
      !endpoint ||
      !region ||
      !accessKeyId ||
      !secretAccessKey ||
      !this.bucket
    ) {
      this.logger.warn(
        'Object Storage configuration is incomplete. Upload functionality will be disabled.',
      );
      return;
    }

    this.s3Client = new AWS.S3({
      endpoint: new AWS.Endpoint(endpoint),
      region,
      s3ForcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // CORS 허용 Origin 설정 (환경변수에서 가져옴, 쉼표로 구분)
    const corsOrigins = this.configService.get<string>('CORS_ALLOWED_ORIGINS');
    this.allowedOrigins = corsOrigins
      ? corsOrigins.split(',').map((o) => o.trim())
      : ['http://localhost:3000'];
  }

  async onModuleInit(): Promise<void> {
    if (this.s3Client && this.allowedOrigins.length > 0) {
      try {
        await this.configureCors(this.allowedOrigins);
      } catch (error) {
        this.logger.warn(
          'Failed to configure CORS (may already be set):',
          error,
        );
      }
    }
  }

  private readonly presignedUrlExpiresIn = 600; // 10분

  private getS3Client(): AWS.S3 {
    if (!this.s3Client) throw new Error('Object storage not configured');
    if (!this.bucket) throw new Error('Object storage bucket not configured');
    return this.s3Client;
  }

  /**
   * Presigned PUT URL 생성
   * @param objectKey Object Storage에 저장될 키
   * @param contentType Content-Type (기본: audio/wav)
   * @param expiresIn URL 만료 시간 (초, 기본: 600)
   * @returns Presigned PUT URL과 만료 시간
   */
  async createPresignedPutUrl(
    objectKey: string,
    contentType: string = 'audio/wav',
    expiresIn: number = this.presignedUrlExpiresIn,
  ): Promise<{ uploadUrl: string; expiresIn: number }> {
    if (!objectKey || objectKey.trim().length === 0) {
      throw new Error('objectKey is required');
    }
    if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new Error('expiresIn must be a positive number');
    }

    const uploadUrl = await this.getS3Client().getSignedUrlPromise(
      'putObject',
      {
        Bucket: this.bucket,
        Key: objectKey,
        ContentType: contentType,
        Expires: expiresIn,
      },
    );

    return { uploadUrl, expiresIn };
  }

  /**
   * Object Storage에 파일 존재 여부 확인 (HEAD 요청)
   * @param objectKey 확인할 Object Key
   * @returns 파일 메타데이터 (존재하지 않으면 exists: false)
   */
  async verifyFileExists(objectKey: string): Promise<{
    exists: boolean;
    contentLength?: number;
    contentType?: string;
  }> {
    if (!objectKey || objectKey.trim().length === 0) {
      throw new Error('objectKey is required');
    }

    try {
      const head = await this.getS3Client()
        .headObject({
          Bucket: this.bucket,
          Key: objectKey,
        })
        .promise();

      return {
        exists: true,
        contentLength: head.ContentLength,
        contentType: head.ContentType,
      };
    } catch (err: unknown) {
      // AWS SDK v2에서 S3 404는 보통 NotFound / NoSuchKey / statusCode 404 등으로 옴
      if (this.isS3NotFoundError(err)) {
        return { exists: false };
      }

      // 권한/네트워크 등 다른 에러는 그대로 올려서 문제를 드러내는 게 안전
      throw err;
    }
  }

  /**
   * Object의 공개 URL 생성
   * @param objectKey Object Key
   * @returns 공개 접근 가능한 URL
   */
  getPublicUrl(objectKey: string): string {
    const endpoint = this.configService.get<string>(
      'NCLOUD_OBJECT_STORAGE_ENDPOINT',
    );
    return `${endpoint}/${this.bucket}/${objectKey}`;
  }

  /**
   * 버킷에 CORS 설정 적용
   * @param allowedOrigins 허용할 Origin 목록 (예: ['https://example.com'])
   */
  async configureCors(allowedOrigins: string[]): Promise<void> {
    if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
      throw new Error('allowedOrigins must be a non-empty array');
    }

    // 브라우저 presigned PUT/GET에서 필요한 최소 구성
    // - PUT 시 Content-Type, x-amz-* 헤더 때문에 AllowedHeaders는 넓게(*)
    // - ExposeHeaders는 프론트에서 ETag 등을 읽고 싶을 때
    const params: AWS.S3.PutBucketCorsRequest = {
      Bucket: this.bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: allowedOrigins,
            AllowedMethods: ['GET', 'PUT', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag', 'x-amz-request-id', 'x-amz-id-2'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    };

    await this.getS3Client().putBucketCors(params).promise();
  }

  private isS3NotFoundError(err: unknown): boolean {
    if (typeof err !== 'object' || err === null) return false;

    const e = err as {
      code?: unknown;
      statusCode?: unknown;
    };

    return (
      e.statusCode === 404 || e.code === 'NotFound' || e.code === 'NoSuchKey'
    );
  }
}
