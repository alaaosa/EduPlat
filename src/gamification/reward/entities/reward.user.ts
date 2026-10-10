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
import { User } from 'src/user/entities/user.entity';
import { Reward } from './reward.entity';

@Table({
  tableName: 'rewards_users',
  timestamps: true,
})
export class RewardUser extends Model<
  InferAttributes<RewardUser>,
  InferCreationAttributes<RewardUser>
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @ForeignKey(() => Reward)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare rewardId: number; 
}
