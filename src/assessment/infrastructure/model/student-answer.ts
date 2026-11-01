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
import { User } from 'src/user/entities/user.entity';
import { Exam } from './exam';
import { Attempt } from './attempt';

@Table({
  tableName: 'student-answers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'questionId'],
    },
    {
      fields: ['examId', 'userId'],
    },
  ],
})
export class StudentAnswer extends Model<
  InferAttributes<StudentAnswer>,
  InferCreationAttributes<StudentAnswer>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User, { as: 'user', foreignKey: 'userId' })
  declare user: NonAttribute<User>;

  @ForeignKey(() => Exam)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare examId: number;

  @BelongsTo(() => Exam, { as: 'exam', foreignKey: 'examId' })
  declare exam: NonAttribute<Exam>;
  @ForeignKey(() => Attempt)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare attemptId: number;

  @BelongsTo(() => Attempt, { as: 'attempt', foreignKey: 'attemptId' })
  declare attempt: NonAttribute<Attempt>;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare questionId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare studentAnswerId: number;
}
