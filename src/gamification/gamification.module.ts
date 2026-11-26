import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HandleException } from 'src/db/db.service';
import { BadgeQueue } from './infrastructure/jobs/queues/badge';
import { BadgeWorker } from './infrastructure/jobs/workers/badge.worker';
import { Badge } from './infrastructure/models/badge/badge';
import { UserBadge } from './infrastructure/models/badge/badge.user';
import { Reward } from './infrastructure/models/reward/reward';
import { RewardUser } from './infrastructure/models/reward/reward.user';
import { DiscountReward } from './infrastructure/models/reward/types/discount_reward';
import { BadgeRepository } from './infrastructure/repo/badge.repo';
import { CompleteCourse } from './application/use-cases/badge';
import { RewardService } from './application/reward.service';
import { RewardHandler } from './application/handlers/reward-handler';
import { RewardRepository } from './infrastructure/repo/reward.repo';
import { RewardController } from './presentation/controllers/reward.controller';
import { GamificationEventReceipt } from './infrastructure/models/badge/gamification-event-receipt';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Badge,
      UserBadge,
      Reward,
      RewardUser,
      DiscountReward,
      GamificationEventReceipt
    ]),
  ],
  controllers: [RewardController],
  providers: [
    HandleException,
    BadgeRepository,
    BadgeWorker,
    CompleteCourse,
    BadgeQueue,
    { provide: 'IBadge', useExisting: BadgeQueue },
    RewardRepository,
    RewardHandler,
    RewardService,
  ],
})
export class GamificationModule {}
