import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { queueNames } from 'src/common/queue';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: queueNames.SEND_EMAIL },
      { name: queueNames.USER },
      { name: queueNames.EXAM },
      { name: queueNames.QUEST },
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

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
