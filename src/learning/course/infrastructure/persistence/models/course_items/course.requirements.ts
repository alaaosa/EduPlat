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
  tableName: 'course_requirements',
  timestamps: true,
  indexes: [
    {
      fields: ['courseId'],
    },
  ],
})
export class CourseRequirement extends Model<
  InferAttributes<CourseRequirement>,
  InferCreationAttributes<CourseRequirement>
> {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare requirement: string;

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
