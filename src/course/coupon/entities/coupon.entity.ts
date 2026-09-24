import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import {
  AfterUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Course } from 'src/course/entities/course.entity';
import { CouponType } from 'src/course/shared/enum/coupon.enum';
import { User } from 'src/user/entities/user.entity';

@Table({
  tableName: 'coupons',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['coupon', 'courseId'],
    },
  ],
})
export class Coupon extends Model<
  InferAttributes<Coupon>,
  InferCreationAttributes<Coupon>
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare coupon: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare endsAt: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare maxUsage: number;
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  declare currentUsage: CreationOptional<number>;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare courseId: number;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [Object.values(CouponType)],
    },
    allowNull: false,
  })
  declare couponType: CouponType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare discountValue: number;

  @BelongsTo(() => Course, { as: 'course' })
  declare course: NonAttribute<Course>;

  @AfterUpdate
  static async removeWhenMaxUsageReached(coupon : Coupon ){
     if (coupon.currentUsage >= coupon.maxUsage) {
    await coupon.destroy();
  }
  }
}
