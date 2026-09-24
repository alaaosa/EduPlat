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
import { Lesson } from 'src/lesson/models/lesson.model';
import {
  examType,
  Mcq_TF_Question,
} from 'src/assessment2/models/MCQ&TF/question';
import { Attempt } from 'src/assessment2/models/attempt';

@Table({
  tableName: 'quizzes',
  indexes: [{ unique: true, fields: ['lessonId'] }],
})
export class Quiz extends Model<
  InferAttributes<Quiz>,
  InferCreationAttributes<Quiz>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  /** Duration in minutes, consumed by the immutable Assessment lifecycle. */
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare duration: number;

  @ForeignKey(() => Lesson)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare lessonId: number;

  @BelongsTo(() => Lesson, {
    as: 'lesson',
    foreignKey: 'lessonId',
    onDelete: 'CASCADE',
  })
  declare lesson: NonAttribute<Lesson>;

  @HasMany(() => Mcq_TF_Question, {
    as: 'questions',
    foreignKey: 'examId',
    sourceKey: 'id',
    scope: { examType: examType.QUIZ },
  })
  declare mcq_tf_questions: NonAttribute<Mcq_TF_Question[]>;

  @HasMany(() => Attempt, {
    as: 'attempts',
    foreignKey: 'assessmentId',
    sourceKey: 'id',
    scope: { examType: examType.QUIZ },
  })
  declare attempts: NonAttribute<Attempt[]>;
}
