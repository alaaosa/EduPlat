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
import { Mcq_TF_Question } from './question';
import { Mcq_TF_Answer } from './answer';
import { Attempt } from '../attempt';

@Table({
  tableName: 'student_answers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['attemptId', 'questionId'],
    },
    { fields: ['attemptId'] },
  ],
})
export class StudentAnswer extends Model<
  InferAttributes<StudentAnswer>,
  InferCreationAttributes<StudentAnswer>
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Mcq_TF_Question)
  @Column({ type: DataType.INTEGER })
  declare questionId: number;

  @BelongsTo(() => Mcq_TF_Question, { as: 'question' })
  declare question: NonAttribute<Mcq_TF_Question>;

  @ForeignKey(() => Mcq_TF_Answer)
  @Column({ type: DataType.INTEGER })
  declare answerId: number;
  @ForeignKey(() => Attempt)
  @Column({ type: DataType.INTEGER })
  declare attemptId: number;

  /** Monotonic per-question revision supplied by the client after recovery. */
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare revision: number;

  @BelongsTo(() => Attempt, { as: 'attempt' })
  declare attempt: NonAttribute<Attempt>;

  @BelongsTo(() => Mcq_TF_Answer, { as: 'answer' })
  declare answer: NonAttribute<Mcq_TF_Answer>;
}
