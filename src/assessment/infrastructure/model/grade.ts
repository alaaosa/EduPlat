import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/user/entities/user.entity';
import { Exam } from './exam';
import { Attempt } from './attempt';

@Table({
  tableName: 'grades',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'examId'],
    },
  ],
})
export class Grade extends Model<
  InferAttributes<Grade>,
  InferCreationAttributes<Grade>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
  })
  declare score: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;
  
  @ForeignKey(() => Attempt)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare attemptId: number;

  @ForeignKey(() => Exam)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare examId: number;

  @BelongsTo(() => Exam, { as: 'exam', foreignKey: 'examId' })
  declare exam: NonAttribute<Exam>;
  @BelongsTo(() => User, { as: 'user', foreignKey: 'userId' })
  declare user: NonAttribute<User>;
}
