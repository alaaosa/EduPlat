import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { queueNames } from 'src/common/queue';
import { BadgeEventType } from 'src/gamification2/domain/shared/enum/badge.enums';
import { IBadge } from 'src/gamification2/domain/shared/interfaces/badge';

@Injectable()
export class BadgeQueue implements IBadge {
  constructor(@InjectQueue(queueNames.BADGE) private readonly queue: Queue) {}

  async addBadgeJob(
    userId: number,
    eventType: BadgeEventType,
    idempotency_key: string,
  ): Promise<void> {
    await this.queue.add(
      'addPoints',
      { userId, eventType },
      { jobId: idempotency_key },
    );
  }
}
