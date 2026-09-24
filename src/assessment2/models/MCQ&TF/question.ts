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

export enum examType {
  FINAL = 'final',
  QUIZ = 'quiz',
}

export enum questionType {
  MCQ = 'mcq',
  TF = 'tf',
}
@Table({
  tableName: 'mcq_questions_quiz',
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
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare examId: number ;

  @Column({
    type: DataType.STRING,
  })
  declare question: string;

  @Column({
    type: DataType.ENUM(...Object.values(questionType)),
    allowNull: false,
  })
  declare questionType: questionType;

  @Column({
    type: DataType.ENUM(...Object.values(examType)),
    allowNull: false,
  })
  declare examType: examType ;

  @HasMany(() => Mcq_TF_Answer, { as: 'answers' })
  declare answers: NonAttribute<Mcq_TF_Answer[]>;
}
