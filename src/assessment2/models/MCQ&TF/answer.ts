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

@Table({
  tableName: 'mcq_answers_quiz',
  indexes: [{ fields: ['questionId'] }],
})
export class Mcq_TF_Answer extends Model<
  InferAttributes<Mcq_TF_Answer>,
  InferCreationAttributes<Mcq_TF_Answer>
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
  })
  declare answer: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  declare isCorrect: boolean;

  @ForeignKey(() => Mcq_TF_Question)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare questionId: number;

  @BelongsTo(() => Mcq_TF_Question)
  declare question: NonAttribute<Mcq_TF_Question>;
}
