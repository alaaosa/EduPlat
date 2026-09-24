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
import { Quest } from './quest.entity';

@Table({ tableName: 'user_quests', timestamps: true })
export class UserQuest extends Model<
  InferAttributes<UserQuest>,
  InferCreationAttributes<UserQuest>
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
  declare user: NonAttribute<Quest>;
  @ForeignKey(() => Quest)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare questId: number;

  @BelongsTo(() => Quest, {
    onDelete: 'CASCADE',
    foreignKey: 'questId',
    as: 'quest',
  })
  declare quest: NonAttribute<Quest>;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare progress: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare lock: boolean;
}
