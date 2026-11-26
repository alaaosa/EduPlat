import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { queueNames } from 'src/common/queue';
import { GamificationJobNames } from 'src/gamification/domain/shared/const/job-names';
import { BadgeEventType } from 'src/gamification/domain/shared/enum/badge.enums';
import { IBadge } from 'src/gamification/domain/shared/interfaces/badge';

@Injectable()
export class BadgeQueue implements IBadge {
  constructor(@InjectQueue(queueNames.BADGE) private readonly queue: Queue) {}

  async addBadgeJob(
    userId: number,
    eventType: BadgeEventType,
    idempotency_key: string,
  ): Promise<void> {
    await this.queue.add(
      GamificationJobNames.ADD_BADGE,
      { userId, eventType, idempotency_key },
      {
        // The stable ID coalesces duplicate enqueues while the job exists;
        // the durable receipt also covers duplicates after job cleanup and
        // BullMQ redelivery after a worker crash.
        jobId: idempotency_key,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
