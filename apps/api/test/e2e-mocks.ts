/**
 * 시나리오 e2e용 외부 의존성 모킹
 * Mail, ObjectStorage, Stt, Llm 등 실제 호출 없이 동작하도록 mock 구현
 */
import { MailService } from '../src/mail/mail.service';
import { ObjectStorageService } from '../src/object-storage/object-storage.service';
import { SttService } from '../src/stt/stt.service';
import { LlmService } from '../src/llm/llm.service';

export const mockMailService: Partial<MailService> = {
  sendVerificationEmail: () => Promise.resolve(undefined),
};

export const mockObjectStorageService: Partial<ObjectStorageService> = {
  createPresignedPutUrl: () =>
    Promise.resolve({
      uploadUrl: 'https://mock-presigned.put.url',
      expiresIn: 600,
    }),
  createPresignedGetUrl: () =>
    Promise.resolve('https://mock-presigned.get.url'),
  verifyFileExists: () =>
    Promise.resolve({ exists: true, contentLength: 1024 }),
  getPublicUrl: (key: string) => `https://mock-storage.example/${key}`,
  deleteObject: () => Promise.resolve(undefined),
};

export const mockSttService: Partial<SttService> = {
  requestStt: () => Promise.resolve({ taskId: 'mock-task-id' }),
};

export const mockLlmService: Partial<LlmService> = {
  callWithSchema: <T>(): Promise<T> =>
    Promise.resolve({ text: 'mock-llm-response' } as unknown as T),
};
