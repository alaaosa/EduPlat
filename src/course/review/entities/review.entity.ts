import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import {
  AfterCreate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Course } from 'src/course/entities/course.entity';

@Table({
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['courseId', 'userId'],
    },
    {
      fields: ['courseId'],
    },
  ],
})
export class Review extends Model<
  InferAttributes<Review>,
  InferCreationAttributes<Review>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare courseId: number;

  @BelongsTo(() => Course, {
    as: 'course',
    foreignKey: 'courseId',
    onDelete: 'CASCADE',
  })
  declare course: NonAttribute<Course>;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare rating: number;

  @Column({
    type: DataType.STRING,
  })
  declare comment: string;
}
