import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { LessonType } from '../shared/enum/lesson.type';
import { Video } from './types/video.model';
import { Section } from 'src/learning/course/infrastructure/persistence/models/section.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { Exam } from 'src/assessment/infrastructure/model/exam';

@Table({
  tableName: 'lessons',
  timestamps: true,
  indexes: [
    {
      fields: ['sectionId'],
    },
  ],
})
export class Lesson extends Model<
  InferAttributes<Lesson>,
  InferCreationAttributes<Lesson>
> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
  })
  declare title: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isPreview: boolean;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [Object.values(LessonType)],
    },
  })
  declare type: LessonType;

  @ForeignKey(() => Section)
  @Column({
    type: DataType.INTEGER,
  })
  sectionId!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare order: number;

  @BelongsTo(() => Section, {
    as: 'section',
    foreignKey: 'sectionId',
    onDelete: 'CASCADE',
  })
  declare section: NonAttribute<Section>;

}
