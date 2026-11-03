import { RewardType } from 'src/gamification2/domain/shared/enum/reward.enum';
import { RewardRepository } from '../../infrastructure/repo/reward.repo';
import { RewardDiscountDTO } from '../../presentation/dto/reward.dto';
import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';

type dtoTypes = RewardDiscountDTO;
@Injectable()
export class RewardHandler {
  constructor(private readonly rewardRepository: RewardRepository) {}
  private readonly rewardRecord: Record<
    RewardType,
    (
      rewrdId: number,
      dto: dtoTypes,
      transaction?: Transaction,
    ) => Promise<dtoTypes>
  > = {
    [RewardType.DISCOUNT]: (rewardId, dto, transaction) =>
      this.rewardRepository.createDiscountReward(
        rewardId,
        dto.discount_value,
        transaction,
      ),
  };

  createRewardType(
    type: RewardType,
    rewardId: number,
    dto: dtoTypes,
    transaction?: Transaction,
  ) {
    return this.rewardRecord[type](rewardId, dto);
  }
}
