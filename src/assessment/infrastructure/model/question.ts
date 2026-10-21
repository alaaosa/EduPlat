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
import { Mcq_TF_Answer } from './answer';
import { QuestionTypes } from 'src/assessment/domain/enum/types-of-questions';
import { Exam } from './exam';

/** delete these lines  */
export enum examType {
  FINAL = 'final',
  QUIZ = 'quiz',
}

export enum questionType {
  MCQ = 'mcq',
  TF = 'tf',
}
@Table({
  tableName: 'mcq_tf_questions',
  indexes: [{ fields: ['examId'] }],
})
export class Mcq_TF_Question extends Model<
  InferAttributes<Mcq_TF_Question>,
  InferCreationAttributes<Mcq_TF_Question>
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Exam)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare examId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare question: string;

  @Column({
    type: DataType.ENUM(...Object.values(QuestionTypes)),
    allowNull: false,
  })
  declare questionType: QuestionTypes;

  @BelongsTo(() => Exam, { as: 'exam', foreignKey: 'examId' })
  declare exam: NonAttribute<Exam>;

  @HasMany(() => Mcq_TF_Answer, { as: 'answers', foreignKey: 'questionId' })
  declare answers: NonAttribute<Mcq_TF_Answer[]>;
}
