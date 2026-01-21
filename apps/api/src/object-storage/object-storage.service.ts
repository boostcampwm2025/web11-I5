import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream } from 'fs';
import * as path from 'path';

interface UploadTask {
  localFilePath: string;
  objectKey: string;
  resolve: (url: string) => void;
  reject: (error: Error) => void;
  retryCount: number;
}

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucket?: string;

  // 동시성 제한을 위한 큐
  private readonly uploadQueue: UploadTask[] = [];
  private activeUploads = 0;
  private readonly maxConcurrentUploads = 5;
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 1000;

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
   * 로컬 파일을 Object Storage에 업로드 (큐 기반 동시성 제한)
   * @param localFilePath 업로드할 로컬 파일 경로
   * @param objectKey Object Storage에 저장될 키 (경로)
   * @returns 업로드된 파일의 공개 URL
   */
  async uploadFile(localFilePath: string, objectKey: string): Promise<string> {
    if (!this.s3Client) {
      throw new Error('Object storage not configured');
    }

    return new Promise<string>((resolve, reject) => {
      this.uploadQueue.push({
        localFilePath,
        objectKey,
        resolve,
        reject,
        retryCount: 0,
      });

      this.processQueue();
    });
  }

  /**
   * 큐에서 작업을 꺼내 처리 (동시성 제한 적용)
   */
  private processQueue(): void {
    while (
      this.activeUploads < this.maxConcurrentUploads &&
      this.uploadQueue.length > 0
    ) {
      const task = this.uploadQueue.shift();
      if (task) {
        this.activeUploads++;
        void this.executeUpload(task);
      }
    }
  }

  /**
   * 실제 업로드 실행 (재시도 로직 포함)
   */
  private async executeUpload(task: UploadTask): Promise<void> {
    try {
      const storageUrl = await this.performUpload(
        task.localFilePath,
        task.objectKey,
      );
      task.resolve(storageUrl);
    } catch (error) {
      const isRetryable = this.isRetryableError(error);

      if (isRetryable && task.retryCount < this.maxRetries) {
        task.retryCount++;
        const delay = this.retryDelayMs * Math.pow(2, task.retryCount - 1);
        this.logger.warn(
          `Upload failed for ${task.objectKey}, retrying (${task.retryCount}/${this.maxRetries}) after ${delay}ms`,
        );

        setTimeout(() => {
          this.uploadQueue.unshift(task); // 큐 앞에 재추가
          this.processQueue();
        }, delay);
      } else {
        this.logger.error(
          `Upload permanently failed for ${task.objectKey} after ${task.retryCount} retries`,
        );
        task.reject(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      this.activeUploads--;
      this.processQueue();
    }
  }

  /**
   * 재시도 가능한 에러인지 판별
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Clock skew, 타임아웃, 네트워크 에러 등
      return (
        message.includes('clock') ||
        message.includes('skew') ||
        message.includes('timeout') ||
        message.includes('econnreset') ||
        message.includes('socket') ||
        message.includes('network') ||
        message.includes('503') ||
        message.includes('500')
      );
    }
    return false;
  }

  /**
   * 실제 S3 업로드 수행
   */
  private async performUpload(
    localFilePath: string,
    objectKey: string,
  ): Promise<string> {
    const fileStream = createReadStream(localFilePath);
    const fileName = path.basename(localFilePath);

    this.logger.log(
      `Attempting upload - Bucket: ${this.bucket}, Key: ${objectKey}, File: ${fileName}`,
    );

    // Upload 클래스를 사용하여 멀티파트 업로드
    const upload = new Upload({
      client: this.s3Client!,
      queueSize: 1,
      params: {
        Bucket: this.bucket,
        Key: objectKey,
        Body: fileStream,
        ContentType: 'audio/wav',
        ACL: 'public-read',
      },
    });

    // 업로드 진행 상황 모니터링
    upload.on('httpUploadProgress', (progress) => {
      this.logger.log(
        `Upload progress: ${progress.loaded} / ${progress.total || 'unknown'} bytes`,
      );
    });

    // 업로드 실행
    await upload.done();

    // Object Storage URL 생성
    const storageUrl = `${this.configService.get<string>('NCLOUD_OBJECT_STORAGE_ENDPOINT')}/${this.bucket}/${objectKey}`;

    this.logger.log(`File uploaded successfully: ${fileName} -> ${storageUrl}`);

    return storageUrl;
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
