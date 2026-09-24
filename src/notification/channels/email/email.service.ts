import { Injectable } from '@nestjs/common';
import { EmailProvider } from '../../../common/providers/email.provider';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { emailTemplate } from './templates/template';
import { queueNames } from 'src/common/queue';

@Injectable()
export class EmailService {
  constructor(
    private readonly emailProvider: EmailProvider,
    @InjectQueue(queueNames.SEND_EMAIL) private readonly emailQueue: Queue,
  ) {}
  async send(dto: any) {
    const { type } = dto;

    const template = emailTemplate[type];

    if (template.background) {
      await this.emailQueue.add(
        'email',
        { dto },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 8000,
          },
          removeOnComplete: {
            age: 60 * 60,
          },
          removeOnFail: {
            age: 24 * 60 * 60,
          },
        },
      );
    }

    await this.emailProvider.send({
      to: dto.data.email,
      from: process.env.EMAIL,
      subject: template.subject,
      html: template.html(dto.data.tokenEmail),
    });
  }
}
