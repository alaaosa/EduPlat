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
import { Instructer } from 'src/instructer/entities/instructer';

@Table({
  tableName: 'payments',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'itemId', 'type'],
    },
    {
      fields: ['instructorId'],
    },
  ],
})
export class Payment extends Model<
  InferAttributes<Payment>,
  InferCreationAttributes<Payment>
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare itemId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare status: string;

  @ForeignKey(() => Instructer)
  @Column({
    type: DataType.INTEGER,
  })
  declare instructorId: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare amount: number;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare platform_fee: number;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare stripe_fee: number;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare instructor_earnings: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare stripePaymentIntentId: string;

  @BelongsTo(() => Instructer, {
    as: 'instructor',
    foreignKey: 'instructorId',
    onDelete: 'SET NULL',
  })
  declare instructor: NonAttribute<Instructer>;
}
