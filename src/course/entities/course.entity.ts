import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/entities/user.entity';
import { CourseRequirement } from './course_items/course.requirements';
import { CourseAudience } from './course_items/course.audience';
import { CourseGoal } from './course_items/course.goal';
import {
  CourseCategory,
  CourseLanguage,
  CourseLevel,
  CourseStatus,
} from '../shared/enum';
import { Section } from './section.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { CourseReject } from './course.reject';
import { Review } from '../review/entities/review.entity';
import { Progress } from './progress';
import { Payment } from 'src/payment/entities/payment.entity';
import { Instructer } from 'src/instructer/entities/instructer';
// slug is stored as string
@Table({
  tableName: 'courses',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['title', 'instructerId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['instructerId'],
    },
  ],
})
export class Course extends Model<
  InferAttributes<Course>,
  InferCreationAttributes<Course>
> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
    allowNull:false
  })
  declare title: string;

  @Column({
    type: DataType.STRING,
    allowNull:false
  })
  declare slug: string;

  @Column({
    type: DataType.STRING,
  })
  declare subTitle: CreationOptional<string>;

  @Column({
    type: DataType.STRING,
  })
  declare description: string;

  @ForeignKey(() => Instructer)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare instructerId: number;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [Object.values(CourseCategory)],
    },
  })
  declare category: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [Object.values(CourseLevel)],
    },
  })
  declare level: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [Object.values(CourseLanguage)],
    },
  })
  declare language: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [Object.values(CourseStatus)],
    },
    defaultValue: CourseStatus.DRAFT,
  })
  declare status: CourseStatus;

  @Column({
    type: DataType.STRING,
  })
  declare thumbnail: string;
  @Column({
    type: DataType.STRING,
  })
  declare public_id: string;

  @Column({
    type: DataType.FLOAT,
  })
  declare price: CreationOptional<number>;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare numOfLessons: CreationOptional<number>;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare sumRating: CreationOptional<number>;
  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  declare avgRating: CreationOptional<number>;
  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  declare total_duration: CreationOptional<number>;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare numOfReviews: CreationOptional<number>;

  //////////////////////////////

  @BelongsTo(() => Instructer, {
    as: 'instructor',
    foreignKey: 'instructerId',
  })
  declare instructor: NonAttribute<Instructer>;

  @HasMany(() => Section, { as: 'sections' })
  declare sections: NonAttribute<Section[]>;

  @HasMany(() => CourseRequirement)
  declare requirements: NonAttribute<CourseRequirement[]>;
  @HasMany(() => CourseAudience)
  declare audiences: NonAttribute<CourseAudience[]>;
  @HasMany(() => CourseGoal)
  declare goals: NonAttribute<CourseGoal[]>;

  @HasMany(() => Enrollment, { as: 'enrollments' })
  declare enrollments: NonAttribute<Enrollment[]>;

  @BelongsToMany(() => User, () => Enrollment)
  declare users: NonAttribute<User[]>;

  @HasOne(() => CourseReject, { as: 'courseReject' })
  declare courseReject: NonAttribute<CourseReject>;

  @HasMany(() => Review, { as: 'reviews', onDelete: 'CASCADE' })
  declare reviews: NonAttribute<Review[]>;

  @HasMany(() => Progress, { as: 'progresses' })
  declare progresses: NonAttribute<Progress[]>;

  @HasMany(() => Payment, { as: 'payments' })
  declare payments: NonAttribute<Payment[]>;

  @DeletedAt
  declare deletedAt: CreationOptional<Date | null>;
}
