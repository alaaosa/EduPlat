import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import {
  BadgeEventType,
  BadgeType,
} from 'src/gamification/shared/enum/badge.enums';
import { UserBadge } from './badge.user';

@Table({
  tableName: 'badges',
  timestamps: true,
  indexes: [
    {
      fields: ['eventType'],
    },
  ],
})
export class Badge extends Model<
  InferAttributes<Badge>,
  InferCreationAttributes<Badge>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;
  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(BadgeType)],
    },
  })
  declare type: BadgeType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare targetNumToUnlock: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(BadgeEventType)],
    },
  })
  declare eventType: BadgeEventType;
  @HasMany(() => UserBadge, { as: 'userBadges'  })
  declare userBadges: NonAttribute<UserBadge[]>;
}
