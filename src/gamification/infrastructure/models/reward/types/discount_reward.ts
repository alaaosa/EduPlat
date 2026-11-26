import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import type { NonAttribute } from 'sequelize';
import { Reward } from '../reward';

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

  @BelongsTo(() => Reward, { foreignKey: 'rewardId', as: 'reward' })
  declare reward: NonAttribute<Reward>;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare discount_value: number;
}
