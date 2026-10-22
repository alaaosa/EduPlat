import { Module } from '@nestjs/common';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Reward } from './entities/reward.entity';
import { RewardUser } from './entities/reward.user';
import { DiscountReward } from './entities/types/discount_reward';
import { RewardRepository } from './repo/reward.repo';
import { RewardHandler } from './repo/handler';
import { HandleException } from 'src/db/db.service';

@Module({
  imports: [SequelizeModule.forFeature([Reward, RewardUser, DiscountReward])],
  controllers: [RewardController],
  providers: [RewardService, RewardRepository, RewardHandler, HandleException],
})
export class RewardModule {}
