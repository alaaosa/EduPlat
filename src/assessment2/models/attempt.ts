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
import { AttemptStatus } from '../shared/enum/attempt';
@Table({
  tableName: 'attempts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['examType', 'assessmentId', 'userId'],
    },
    {
      fields: ['examType', 'assessmentId', 'userId', 'status'],
    },
    {
      fields: ['status', 'expiresAt'],
    },
    {
      fields:['userId','examType', 'status']
    }
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
