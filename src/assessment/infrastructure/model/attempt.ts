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
  HasOne,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/entities/user.entity';
import { Exam } from './exam';
import { AttemptStatus } from 'src/assessment/domain/enum/attempt';
import { Grade } from './grade';

@Table({
  tableName: 'attempts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['examId', 'userId'],
    },
    {
      fields: ['examId', 'userId', 'status'],
    },
    {
      fields: ['status', 'expiresAt'],
    },
    
  ],
})
export class Attempt extends Model<
  InferAttributes<Attempt>,
  InferCreationAttributes<Attempt>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Exam)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare examId: number;

  @BelongsTo(() => Exam, { as: 'exam', foreignKey: 'examId' })
  declare exam: NonAttribute<Exam>;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare startedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expiresAt: Date;

  @Index('user_Idx')
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User, { as: 'user', foreignKey: 'userId' })
  declare user: NonAttribute<User>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(AttemptStatus)],
    },
  })
  declare status: AttemptStatus;

  @HasOne(() => Grade, { as: 'grade' })
  declare grade: NonAttribute<Grade>;
}
