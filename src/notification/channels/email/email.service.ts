import { Injectable } from '@nestjs/common';
import { EmailProvider } from '../../../common/providers/email.provider';
import { ISendNotification } from 'src/notification/interfaces/notification-channel.interface';

@Injectable()
export class EmailService {
  constructor(private readonly emailProvider: EmailProvider) {}
  async send(dto: ISendNotification) {
    await this.emailProvider.send({
      to: dto.data.email,
      from: process.env.EMAIL,
      subject: dto.subject,
      html: dto.data.body,
    });
  }
}
