import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Course } from '../course.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';

@Table({
  tableName: 'course_audience',
  timestamps: true,
  indexes: [
    {
      fields: ['courseId'],
    },
  ],
})
export class CourseAudience extends Model<
  InferAttributes<CourseAudience>,
  InferCreationAttributes<CourseAudience>
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
  declare audience: string;

  @BelongsTo(() => Course, {
    as: 'course',
    foreignKey: 'courseId',
    onDelete: 'CASCADE',
  })
  declare course: NonAttribute<Course>;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare courseId: number;
}
