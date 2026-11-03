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
  tableName: 'leaderboard_users',
  indexes: [
    {
      unique: true,
      fields: ['userId'],
    },
  ],
})
export class Leaderboard extends Model<
  InferAttributes<Leaderboard>,
  InferCreationAttributes<Leaderboard>
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

  @BelongsTo(() => User, {
    onDelete: 'CASCADE',
    foreignKey: 'userId',
    as: 'user',
  })
  declare user: NonAttribute<User>;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare xp_rank: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare xp_using: CreationOptional<number>;
}
