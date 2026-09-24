import { Injectable } from '@nestjs/common';
import { RewardRepository } from './repo/reward.repo';
import { RewardDto } from './dto/reward.dto';
import { RewardType } from '../shared/enum/reward.enum';
import { RewardHandler } from './repo/handler';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class RewardService {
  constructor(
    private readonly rewardRepository: RewardRepository,
    private readonly rewardHandler: RewardHandler,
    @InjectConnection() private sequlize: Sequelize,
  ) {}

  async create(dto: RewardDto, adminId: number) {
    const { detailsDto, ...details } = dto;
    return await this.sequlize.transaction(async (transaction) => {
      const reward = await this.rewardRepository.createReward(
        {
          publicId: details.image.public_id,
          iconUrl: details.image.url,
          ...details,
        },
        adminId,
        transaction,
      );

      await this.rewardHandler.createRewardType(
        dto.rewardType,
        reward.id,
        detailsDto,
        transaction,
      );

      return reward;
    });
  }
}
