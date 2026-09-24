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
import { Course } from 'src/course/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import { Coupon } from './coupon.entity';

@Table({
  tableName: 'coupons_users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['couponId', 'userId'],
    },
  ],
})
export class CouponUser extends Model<
  InferAttributes<CouponUser>,
  InferCreationAttributes<CouponUser>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Coupon)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare couponId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;
}
