import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from 'src/user/entities/user.entity';
import { examType } from './question';

@Table({ tableName: 'grades', timestamps: true })
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

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare examId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(examType)],
    },
  })
  declare examType: examType;
}
