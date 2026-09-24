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
import { Course } from './course.entity';

@Table({
  tableName: 'course_errors',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['courseId'],
    },
  ],
})
export class CourseReject extends Model<
  InferAttributes<CourseReject>,
  InferCreationAttributes<CourseReject>
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
  declare reason: string;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare courseId: number;

  @BelongsTo(() => Course, { as: 'course' })
  declare course: NonAttribute<Course>;
}
