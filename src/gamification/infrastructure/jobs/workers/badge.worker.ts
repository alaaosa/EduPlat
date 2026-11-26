import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queueNames } from 'src/common/queue';
import { BadgeRepository } from '../../repo/index';
import { Logger } from '@nestjs/common';

@Processor(queueNames.BADGE)
export class BadgeWorker extends WorkerHost {
  private readonly logger = new Logger(BadgeWorker.name);
  constructor(private readonly badgeRepository: BadgeRepository) {
    super();
  }
  async process(job: Job) {
    const { userId, eventType, idempotency_key } = job.data;
    try {
      await this.badgeRepository.processBadgeEvent(
        userId,
        eventType,
        idempotency_key,
      );
    } catch (error) {
      this.logger.error(
        `Badge event ${idempotency_key} failed for user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
