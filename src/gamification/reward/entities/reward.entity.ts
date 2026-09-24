import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { RewardType } from 'src/gamification/shared/enum/reward.enum';
import { User } from 'src/user/entities/user.entity';
import { DiscountReward } from './types/discount_reward';

@Table({ tableName: 'rewards', timestamps: true })
export class Reward extends Model<
  InferAttributes<Reward>,
  InferCreationAttributes<Reward>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare iconUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare publicId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(RewardType)],
    },
  })
  declare rewardType: RewardType;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare cost: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare adminId: number;

  @BelongsTo(() => User)
  declare admin: NonAttribute<User>;

  @HasOne(() => DiscountReward, { as: 'discount' })
  declare discount?: NonAttribute<DiscountReward>;
}
