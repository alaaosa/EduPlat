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

@Table({
  tableName: 'user_states',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId'],
    },
  ],
})
export class UserState extends Model<
  InferAttributes<UserState>,
  InferCreationAttributes<UserState>
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
    unique: true,
  })
  declare userId: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare courseCompleted: CreationOptional<number>;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare xp: CreationOptional<number>;
}
