import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '말만해 회원가입 이메일 인증',
      html: `
        <h1>이메일 인증</h1>
        <p>인증 코드: <strong>${code}</strong></p>
        <p>10분 이내에 입력해주세요</p>
      `,
    });
  }
}
