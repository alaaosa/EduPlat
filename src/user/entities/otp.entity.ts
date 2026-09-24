import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';

@Table({
  tableName: 'otps',
  timestamps:true,
  indexes: [{ fields: ['userId'] }],
})
export class OTP extends Model<
  InferAttributes<OTP>,
  InferCreationAttributes<OTP>
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
    type: DataType.STRING,
  })
  declare otp: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isUsed: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expiresAt: Date;
}
