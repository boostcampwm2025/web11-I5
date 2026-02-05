import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

const mockMailerService = {
  sendMail: jest.fn(),
};

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('이메일과 인증 코드로 인증 메일을 발송해야 한다', async () => {
      const email = 'user@example.com';
      const code = 'ABC123';

      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendVerificationEmail(email, code);

      type SendMailOptions = { to: string; subject: string; html: string };
      const sendMailCalls = mockMailerService.sendMail.mock
        .calls as unknown as [SendMailOptions][];
      expect(sendMailCalls).toHaveLength(1);
      const firstArg = sendMailCalls[0][0];
      expect(firstArg.to).toBe(email);
      expect(firstArg.subject).toBe('말만해 회원가입 이메일 인증');
      expect(firstArg.html).toContain(code);
      expect(firstArg.html).toContain('10분 이내에 입력해주세요');
    });
  });
});
