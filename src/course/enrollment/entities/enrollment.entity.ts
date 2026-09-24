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
import { Course } from 'src/course/entities/course.entity';
import { EnrollmentTypes } from 'src/course/shared/enum/enrollment.enum';
import { User } from 'src/user/entities/user.entity';

@Table({
  tableName: 'enrollments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'courseId'],
    },
    {
      fields: ['courseId'],
    },
  ],
})
export class Enrollment extends Model<
  InferAttributes<Enrollment>,
  InferCreationAttributes<Enrollment>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [Object.values(EnrollmentTypes)],
    },
    allowNull: false,
  })
  declare enrollmentType: EnrollmentTypes;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User, { as: 'user' })
  declare user: NonAttribute<User>;

  @BelongsTo(() => Course, { as: 'course', foreignKey: 'courseId' })
  declare course: NonAttribute<Course>;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare courseId: number;
}
