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
import { User } from 'src/user/entities/user.entity';
import { Reward } from './reward';

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

  @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
  declare user: NonAttribute<User>;

  @ForeignKey(() => Reward)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare rewardId: number;

  @BelongsTo(() => Reward, { foreignKey: 'rewardId', as: 'reward' })
  declare reward: NonAttribute<Reward>;
}
