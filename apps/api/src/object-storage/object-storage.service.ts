import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream } from 'fs';
import * as path from 'path';

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucket?: string;

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
    );

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

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // 네이버 클라우드 Object Storage 필수 설정
      // AWS SDK v3는 기본적으로 Signature Version 4 사용
    });
  }

  /**
   * 로컬 파일을 Object Storage에 업로드
   * @param localFilePath 업로드할 로컬 파일 경로
   * @param objectKey Object Storage에 저장될 키 (경로)
   * @returns 업로드된 파일의 공개 URL
   */
  async uploadFile(localFilePath: string, objectKey: string): Promise<string> {
    if (!this.s3Client) {
      throw new Error('Object storage not configured');
    }

    try {
      const fileStream = createReadStream(localFilePath);
      const fileName = path.basename(localFilePath);

      this.logger.log(
        `Attempting upload - Bucket: ${this.bucket}, Key: ${objectKey}, File: ${fileName}`,
      );

      // Upload 클래스를 사용하여 멀티파트 업로드
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: objectKey,
          Body: fileStream,
          ContentType: 'audio/wav', // WAV 파일 기본값
          ACL: 'public-read', // 공개 읽기 권한 설정
        },
      });

      // 업로드 진행 상황 모니터링 (선택 사항)
      upload.on('httpUploadProgress', (progress) => {
        this.logger.log(
          `Upload progress: ${progress.loaded} / ${progress.total || 'unknown'} bytes`,
        );
      });

      // 업로드 실행
      await upload.done();

      // Object Storage URL 생성
      const storageUrl = `${this.configService.get<string>('NCLOUD_OBJECT_STORAGE_ENDPOINT')}/${this.bucket}/${objectKey}`;

      this.logger.log(
        `File uploaded successfully: ${fileName} -> ${storageUrl}`,
      );

      return storageUrl;
    } catch (error) {
      this.logger.error(
        `Failed to upload file to Object Storage: ${localFilePath}`,
      );
      this.logger.error(`Bucket: ${this.bucket}, Key: ${objectKey}`);
      this.logger.error(`Full error: ${JSON.stringify(error, null, 2)}`);

      throw error;
    }
  }

  /**
   * 버킷 목록 조회 (연결 테스트용)
   * @returns 버킷 목록
   */
  async listBuckets(): Promise<any> {
    if (!this.s3Client) {
      throw new Error('Object storage not configured');
    }

    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3Client.send(command);

      this.logger.log(
        `Buckets retrieved successfully: ${JSON.stringify(response.Buckets)}`,
      );

      return response.Buckets;
    } catch (error) {
      this.logger.error('Failed to list buckets from Object Storage');
      this.logger.error(`Full error: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
  }
}
