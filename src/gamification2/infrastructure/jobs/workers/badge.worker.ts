import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queueNames } from 'src/common/queue';
import { BadgeRepository } from '../../repo/badge.repo';
import { Logger } from '@nestjs/common';

@Processor(queueNames.BADGE)
export class BadgeWorker extends WorkerHost {
  private readonly logger = new Logger(BadgeWorker.name);
  constructor(private readonly badgeRepository: BadgeRepository) {
    super();
  }
  async process(job: Job, token?: string): Promise<any> {
    const { userId, eventType } = job.data;

    const badges = await this.badgeRepository.findAllBasedOnEventType(
      eventType,
      userId,
    );
    if (!badges || badges.length == 0) {
      this.logger.warn("worker can't receive badges");
      return ``;
    }

    badges.map(
      async ({ id }) =>
        await this.badgeRepository.incrementUserBadgeProgress(userId, id),
    );
  }
}
