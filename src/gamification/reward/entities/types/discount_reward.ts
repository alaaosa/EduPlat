import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Reward } from '../reward.entity';

@Table({ tableName: 'discount_rewards' })
export class DiscountReward extends Model<
  InferAttributes<DiscountReward>,
  InferCreationAttributes<DiscountReward>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Reward)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare rewardId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare discount_value: number;
}
