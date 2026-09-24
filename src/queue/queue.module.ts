import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { queueNames } from 'src/common/queue';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: queueNames.SEND_EMAIL },
      {
        name: queueNames.ASSESSMENT,
        defaultJobOptions: {
          removeOnComplete: true,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      },
      {
        name: queueNames.BADGE,
        defaultJobOptions: {
          removeOnComplete: true,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
