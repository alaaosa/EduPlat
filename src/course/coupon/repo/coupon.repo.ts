import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Coupon } from '../entities/coupon.entity';
import { CouponUser } from '../entities/coupon.user';
import {
  CreationAttributes,
  Op,
  Sequelize,
  Transaction,
  where,
} from 'sequelize';
import { HandleException } from 'src/db/db.service';

type createCoupon = Omit<CreationAttributes<Coupon>, 'courseId'>;
type createCouponUser = Omit<CreationAttributes<CouponUser>, 'userId'>;
@Injectable()
export class CouponRepository {
  constructor(
    private readonly exceptionHandler: HandleException,
    @InjectModel(Coupon) private readonly couponModel: typeof Coupon,
    @InjectModel(CouponUser)
    private readonly couponUserModel: typeof CouponUser,
  ) {}

  /**
   *
   * @param data
   * @param courseId
   * @returns record of coupon that created in db
   */
  createCoupon(data: createCoupon, courseId: number) {
    return this.exceptionHandler.handle(async () =>
      this.couponModel.create({ ...data, courseId }),
    );
  }

  findById(id: number) {
    return this.exceptionHandler.handle(async () =>
      this.couponModel.findByPk(id),
    );
  }

  findUserCouponById(userId: number, couponId: number) {
    return this.exceptionHandler.handle(async () =>
      this.couponUserModel.findOne({ where: { userId, couponId } }),
    );
  }

  findByCoupon(coupon: string ) {
    return this.exceptionHandler.handle(async () =>
      this.couponModel.findOne({ where: { coupon } }),
    );
  }

  /**
   * @param data
   * @param userId
   */
  createCouponOfUser(
    data: createCouponUser,
    userId: number,
    transaction?: Transaction,
  ) {
    return this.exceptionHandler.handle(async () =>
      this.couponUserModel.create({ ...data, userId }, { transaction }),
    );
  }

  async updateCounter(coupon: string, transaction?: Transaction) {
    return this.exceptionHandler.handle(async () => {
      const [affected] = await this.couponModel.update(
        {
          currentUsage: Sequelize.literal('currentUsage + 1'),
        },
        {
          where: {
            coupon,
            currentUsage: {
              [Op.lt]: Sequelize.col('maxUsage'),
            },
          },
          individualHooks: true,
          transaction,
        },
      );
      if (affected === 0)
        throw new BadRequestException('coupon limit is expired');

      return affected;
    });
  }

  deleteCoupon(id: number) {
    return this.exceptionHandler.handle(async () =>
      this.couponModel.destroy({ where: { id } }),
    );
  }
}
