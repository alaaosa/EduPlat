import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponRepository } from '../infrastructure/prese/repo/coupon.repo.imp';
import { CreateCouponDTO } from '../presentation/coupon/dto/coupon.dto';
import { CourseRepository } from '../../learning/course/infrastructure/persistence/sequelize/course.repo';
import { CouponEntity } from '../domain/coupon/entity';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepo: CouponRepository,
    private readonly courseRepo: CourseRepository,
  ) {}

  /**
   *
   * @param courseId
   * @param dto
   * @description create coupon
   */
  async create(courseId: number, dto: CreateCouponDTO, instructerId: number) {
    const course = await this.courseRepo.isExist(courseId);

    if (!course) throw new NotFoundException('course not found');

    if (course.instructerId !== instructerId)
      throw new ForbiddenException('not allowed for you');

    const coupon_entity = CouponEntity.instance({
      courseId,
      ...dto,
      currentUsage: 0,
    });
    coupon_entity.create();

    const coupon = await this.couponRepo.createCoupon(
      dto,
      courseId,
      instructerId,
    );

    return coupon;
  }

  /**
   * @param coupon
   * @param courseId
   * @param req
   * @returns original price and new price after applying coupon
   */
  async validateCoupon(
    coupon: string,
    courseId: number,
    session: Express.Request['session'],
  ): Promise<any> {
    const course = await this.courseRepo.isExist(courseId);
    if (!course) throw new NotFoundException('course price not available');

    const couponData = await this.couponRepo.findByCoupon(coupon);
    couponData.canApply(courseId);
    const price = couponData.calcDiscount(course.price);

    session.pricing = {
      courseId,
      couponId: undefined,
      price,
    };

    return {
      original_price: course.price,
      new_price: price,
    };
  }

  /**
   * @param couponId
   * @param instructerId
   * @returns num of  rows that deleted
   */
  async delete(couponId: number, instructerId: number) {
    return this.couponRepo.deleteCoupon(couponId, instructerId);
  }
}
