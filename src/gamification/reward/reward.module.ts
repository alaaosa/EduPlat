import { Module } from '@nestjs/common';
import { RewardService } from '../../gamification2/application/reward.service';
import { RewardController } from '../../gamification2/presentation/controllers/reward.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Reward } from '../../gamification2/infrastructure/models/reward/reward';
import { RewardUser } from '../../gamification2/infrastructure/models/reward/reward.user';
import { DiscountReward } from '../../gamification2/infrastructure/models/reward/types/discount_reward';
import { RewardRepository } from '../../gamification2/infrastructure/repo/reward.repo';
import { RewardHandler } from '../../gamification2/application/handlers/reward-handler';
import { HandleException } from 'src/db/db.service';

@Module({
  imports: [SequelizeModule.forFeature([Reward, RewardUser, DiscountReward])],
  controllers: [RewardController],
  providers: [RewardService, RewardRepository, RewardHandler, HandleException],
})
export class RewardModule {}
