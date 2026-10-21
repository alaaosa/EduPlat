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
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Mcq_TF_Question } from 'src/assessment2/models/MCQ&TF/question';
import { Course } from 'src/learning/course/infrastructure/persistence/models/course.entity';

@Table({
  tableName: 'finals',
  timestamps: true,
  indexes: [{ unique: true, fields: ['courseId'] }],
})
export class Final extends Model<
  InferAttributes<Final>,
  InferCreationAttributes<Final>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.DECIMAL(3, 2),
    allowNull: false,
  })
  declare passingScore: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare duration: number;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare courseId: number;

  @BelongsTo(() => Course, { as: 'course' })
  declare course: NonAttribute<Course>;

  @HasMany(() => Mcq_TF_Question, { as: 'questions' })
  declare mcq_tf_questions: NonAttribute<Mcq_TF_Question[]>;
}
