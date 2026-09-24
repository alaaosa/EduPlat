import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queueNames } from 'src/common/queue';
import { BadgeRepository } from './repo/badge.repo';
import { Logger } from '@nestjs/common';

@Processor(queueNames.BADGE)
export class BadgeWorker extends WorkerHost {
  constructor(
    private readonly badgeRepository: BadgeRepository,
    private readonly logger = new Logger(BadgeWorker.name),
  ) {
    super();
  }
  async process(job: Job, token?: string): Promise<any> {
    const { userId, eventType } = job.data;

    const badges = await this.badgeRepository.findAllBasedOnEventType(
      eventType,
      userId,
    );
    if (!badges || badges.length == 0) {
      this.logger.warn('worker can"t receive badges');
      return ``;
    }

    badges.map(
      async ({ id }) =>
        await this.badgeRepository.incrementUserBadgeProgress(userId, id),
    );

    // if (userBadges.length > 0) {
    //   if (
    //     userBadges[0].lock === false ||
    //     userBadges[0].progress >= badge.targetNumToUnlock
    //   ) {
    //     return;
    //   }
    // }

    // const badgesMap = badges
    //   .map(async ({ userBadges, ...badge }) => {
    //     // if (userBadges.length > 0) {
    //     //   if (
    //     //     userBadges[0].lock === false ||
    //     //     userBadges[0].progress >= badge.targetNumToUnlock
    //     //   ) {
    //     //     return;
    //     //   }
    //     // }

    //     await this.badgeRepository.incrementUserBadgeProgress(userId, badge.id);

    //     return {
    //       ...badge,
    //       userBadges,
    //     };
    //   })
    //   .filter(Object);
  }

  async handleJob() {}
}
