import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import {
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/entities/user.entity';
import { Badge } from './badge.entity';

@Table({
  tableName: 'user_badges',
  indexes: [{ unique: true, fields: ['badgeId', 'userId'] }],
})
export class UserBadge extends Model<
  InferAttributes<UserBadge>,
  InferCreationAttributes<UserBadge>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User, {
    onDelete: 'CASCADE',
    foreignKey: 'userId',
    as: 'user',
  })
  declare user: NonAttribute<User>;
  @ForeignKey(() => Badge)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare badgeId: number;

  @BelongsTo(() => Badge, {
    onDelete: 'CASCAD',
    foreignKey: 'badgeId',
    as: 'badge',
  })
  declare badge: NonAttribute<Badge>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare progress: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare lock: CreationOptional<boolean>;


}
