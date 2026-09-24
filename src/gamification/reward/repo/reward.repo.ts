import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Reward } from '../entities/reward.entity';
import { RewardUser } from '../entities/reward.user';
import { CreationAttributes, Transaction } from 'sequelize';
import { HandleException } from 'src/db/db.service';
import { DiscountReward } from '../entities/types/discount_reward';

type createReward = Omit<CreationAttributes<Reward>, 'adminId'>;
@Injectable()
export class RewardRepository {
  constructor(
    private readonly handlerException: HandleException,
    @InjectModel(Reward) private readonly rewardModel: typeof Reward,
    @InjectModel(RewardUser) private readonly rewardUser: typeof RewardUser,
    @InjectModel(DiscountReward)
    private readonly discount_rewardModel: typeof DiscountReward,
  ) {}

  createReward(data: createReward, adminId: number, transaction?: Transaction) {
    return this.handlerException.handle(async () =>
      this.rewardModel.create({ ...data, adminId }, { transaction }),
    );
  }

  createUserReward(userId: number, rewardId: number) {
    return this.handlerException.handle(async () =>
      this.rewardUser.create({ rewardId, userId }),
    );
  }

  /**
   *
   * @param rewardId
   * @param discount_value
   * @description this method depends on create reward first (transaction)
   */
  createDiscountReward(
    rewardId: number,
    discount_value: number,
    transaction?: Transaction,
  ) {
    return this.handlerException.handle(async () =>
      this.discount_rewardModel.create(
        { rewardId, discount_value },
        { transaction },
      ),
    );
  }

  findRewardDiscount(rewardId: number) {
    return this.handlerException.handle(async () =>
      this.discount_rewardModel.findOne({ where: { rewardId }, raw: true }),
    );
  }
}
