import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/entities/user.entity';
import { examType } from './MCQ&TF/question';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  FINALIZING = 'finalizing',
  COMPLETED = 'completed',
}
@Table({
  tableName: 'attempts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['examType', 'assessmentId', 'userId'],
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
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare assessmentId: number;

  /** Server-owned timing. BullMQ only wakes the finalizer; it does not define expiry. */
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

  @Column({
    type: DataType.DECIMAL(5, 2),
  })
  declare studentScore: number | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(examType)],
    },
  })
  declare examType: examType;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(AttemptStatus)],
    },
  })
  declare status: AttemptStatus;
}
