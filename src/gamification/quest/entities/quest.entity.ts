import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { UserQuest } from './user.quest';
import { QuestEventNames } from 'src/gamification/shared/enum/quest.enum';

@Table({
  tableName: 'quests',
  timestamps: true,
  indexes: [
    {
      fields: ['eventType'],
    },
  ],
})
export class Quest extends Model<
  InferAttributes<Quest>,
  InferCreationAttributes<Quest>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare description: string;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare xp_reward: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare num_to_unlock: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(QuestEventNames)],
    },
  })
  declare eventType: QuestEventNames;

  @HasMany(() => UserQuest, { as: 'userQuests' })
  declare userQuests: NonAttribute<UserQuest[]>;
}
