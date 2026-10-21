import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import {
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { ExamTypes } from 'src/assessment/domain/enum/types-of-exam';
import { Mcq_TF_Question } from './question';
import { Attempt } from './attempt';

@Table({
  tableName: 'exams',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['itemId'], where: { type: ExamTypes.FINAL } },
  ],
})
export class Exam extends Model<
  InferAttributes<Exam>,
  InferCreationAttributes<Exam>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
  })
  declare passingScore: number;

  /** duration consist of minutes here */
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare duration: number;

  /** itemId may be courseId , lessonId , Based on the type */
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare itemId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(ExamTypes)],
    },
  })
  declare type: ExamTypes;

  @HasMany(() => Mcq_TF_Question, { as: 'questions', sourceKey: 'id' })
  declare mcq_tf_questions: NonAttribute<Mcq_TF_Question[]>;

  @HasMany(() => Attempt, { as: 'attempts' })
  declare attempts: NonAttribute<Attempt[]>;
}
