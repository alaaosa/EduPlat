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
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/entities/user.entity';

@Table({
  tableName: 'streaks',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'date'],
    },
  ],
})
export class Streak extends Model<
  InferAttributes<Streak>,
  InferCreationAttributes<Streak>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User, { as: 'user', foreignKey: 'userId' })
  declare user: NonAttribute<User>;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare currentStreak: number;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare longestStreak: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare lastActivityDate: string;
}
