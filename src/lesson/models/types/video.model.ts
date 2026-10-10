import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Lesson } from '../lesson.model';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { Progress } from '../lesson.user';

@Table({
  tableName: 'videos',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['lessonId'],
    },
  ],
}) 
export class Video extends Model<
  InferAttributes<Video>,
  InferCreationAttributes<Video>
> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  declare id: CreationOptional<number>;
  @ForeignKey(() => Lesson)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare lessonId: number;

  @BelongsTo(() => Lesson, {
    as: 'lesson',
    foreignKey: 'lessonId',
  })
  declare lesson: NonAttribute<Lesson>;

  @Column({
    type: DataType.STRING,
  })
  declare muxAssetId: CreationOptional<string>;
  @Column({
    type: DataType.STRING,
  })
  declare playbackId: CreationOptional<string>;

  @Column({ type: DataType.FLOAT })
  declare duration: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
  })
  declare status: CreationOptional<string>;

  @HasOne(() => Progress)
  declare progress: NonAttribute<Progress>;
}
