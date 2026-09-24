import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailProvider } from '../../../common/providers/email.provider';
import { emailTemplate } from './templates/template';
import { queueNames } from 'src/common/queue';

@Processor(queueNames.SEND_EMAIL, { concurrency: 10 })
export class EmailWorker extends WorkerHost {
  constructor(private emailProvider: EmailProvider) {
    super();
  }
  async process(job: Job, token?: string): Promise<any> {
    const { dto } = job.data;

    const template = emailTemplate[dto.type];

    await this.emailProvider.send({
      to: dto.data.email,
      from: process.env.EMAIL,
      subject: template.subject,
      html: template.html(dto.data.tokenEmail),
    });
  }
}
