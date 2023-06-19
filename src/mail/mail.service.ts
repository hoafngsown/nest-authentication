import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: '../mails/verification.hbs',
      context: {
        username: user.firstName + '' + user.lastName,
        verificationLink: 'localhost:3001/auth/confirm?token=' + token,
      },
    });
  }
}
