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
import { Lesson } from './lesson.model';
import { User } from 'src/user/entities/user.entity';
import { Video } from './types/video.model';

@Table({
  tableName: 'lesson_users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['videoId', 'userId'],
    },{
      fields: ['completed'],
    }
  ],
})
export class Progress extends Model<
  InferAttributes<Progress>,
  InferCreationAttributes<Progress>
> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Video)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare videoId: number;

  @BelongsTo(() => Video, {
    as: 'video',
    foreignKey: 'videoId',
  })
  declare video: NonAttribute<Video>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare progress: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare completed: boolean;
}
