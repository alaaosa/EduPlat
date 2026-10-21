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

@Table({
  tableName: 'student-answers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'questionId'],
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
