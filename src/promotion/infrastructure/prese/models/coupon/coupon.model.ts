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
import { Course } from 'src/learning/course/infrastructure/persistence/models/course.entity';
import { CouponType } from 'src/learning/course/domain/enums/coupon.enum';
import { User } from 'src/user/entities/user.entity';
import { Instructer } from 'src/instructer/entities/instructer';

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

  @ForeignKey(() => Instructer)
  declare instructerId: number;

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

  @BelongsTo(() => Instructer, { as: 'instructer', foreignKey: 'instructerId' })
  declare instructer: NonAttribute<Instructer>;
  @AfterUpdate
  static async removeWhenMaxUsageReached(coupon: Coupon) {
    if (coupon.currentUsage >= coupon.maxUsage) {
      await coupon.destroy();
    }
  }
}
