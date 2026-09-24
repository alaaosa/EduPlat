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
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';

@Table({
  tableName: 'instructer_billings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['instructerId'],
    },
  ],
})
export class InstructerBilling extends Model<
  InferAttributes<InstructerBilling>,
  InferCreationAttributes<InstructerBilling>
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
  declare instructerId: number;

  @BelongsTo(() => User, { as: 'instructer' })
  declare instructer: NonAttribute<User>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare stripeAccountId: string;
}
