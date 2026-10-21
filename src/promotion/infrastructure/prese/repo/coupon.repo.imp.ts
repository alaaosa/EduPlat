import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Coupon } from '../models/coupon/coupon.model';
import { CouponUser } from '../models/coupon/coupon.user';
import {
  CreationAttributes,
  Op,
  Sequelize,
  Transaction,
  where,
} from 'sequelize';
import { HandleException } from 'src/db/db.service';
import { CouponEntity } from 'src/promotion/domain/coupon/entity';

type createCoupon = Omit<
  CreationAttributes<Coupon>,
  'courseId' | 'instructerId'
>;
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
  createCoupon(data: createCoupon, courseId: number, instructerId: number) {
    return this.exceptionHandler.handle(async () =>
      this.couponModel.create({ ...data, courseId, instructerId }),
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

  findByCoupon(coupon: string) {
    return this.exceptionHandler.handle(async () => {
      const props = await this.couponModel.findOne({ where: { coupon } });

      if (!props) throw new NotFoundException('coupon not found');
      return CouponEntity.instance(props);
    });
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

  deleteCoupon(id: number , instructerId : number) {
    return this.exceptionHandler.handle(async () =>
      this.couponModel.destroy({ where: { id , instructerId } }),
    );
  }
}
