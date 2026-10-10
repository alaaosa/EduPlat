import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponRepository } from './repo/coupon.repo';
import { CouponUserDTO, CreateCouponDTO } from './dto/coupon.dto';
import { CourseRepository } from '../repo/course.repo';
import { CouponType } from '../shared/enum/coupon.enum';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { course_checkout_dto } from 'src/checkout/dto/course_checkout_dto';
import { Request } from 'express';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepo: CouponRepository,
    private readonly courseRepo: CourseRepository,
    @InjectConnection() private sequlize: Sequelize,
  ) {}

  /**
   *
   * @param courseId
   * @param dto
   * @description create coupon
   */
  async create(courseId: number, dto: CreateCouponDTO) {
    const course = await this.courseRepo.isExist(courseId);

    if (!course) throw new NotFoundException('course not found');

    const endsAt = new Date(dto.endsAt).getTime();
    if (endsAt <= Date.now())
      throw new BadRequestException(
        'the expiration time must be in the future',
      );

    this.validateCouponValue(dto.couponType, course.price, dto.discountValue);

    const coupon = await this.couponRepo.createCoupon(dto, courseId);

    return coupon;
  }

  /**
   *
   * @param couponType
   * @param price
   * @param discountValue
   * @description check on the price
   */
  private validateCouponValue(
    couponType: CouponType,
    price: number,
    discountValue: number,
  ) {
    if (couponType === CouponType.FIXED) {
      if (price < discountValue) {
        throw new BadRequestException(
          'not allowed for giving coupon with discount value larger than course price ',
        );
      }
    } else if (couponType === CouponType.PRECENTAGE) {
      if (discountValue > 30)
        throw new BadRequestException(
          'not allowed discount larger than 30% !!!',
        );
    }
  }

  /**
   * @param coupon 
   * @param courseId 
   * @param req 
   * @returns original price, coupon details and new price after applying coupon
   */
  async validateCoupon(
    coupon: string,
    courseId: number,
    req: Request,
  ): Promise<any> {
    const coupon_exist = await this.couponRepo.findByCoupon(coupon);
    if (!coupon_exist) throw new NotFoundException('coupon not valid');

    if (coupon_exist.courseId !== courseId)
      throw new BadRequestException('coupon not valid');

    const date = new Date(coupon_exist.endsAt).getTime();
    if (date < Date.now()) throw new BadRequestException('coupon is expired');

    if (coupon_exist.currentUsage == coupon_exist.maxUsage)
      throw new ForbiddenException('coupon not valid');

    const course = await this.courseRepo.isExist(courseId);
    if (!course) throw new NotFoundException('course price not available');
    let price: number;

    if (coupon_exist.couponType === CouponType.PRECENTAGE) {
      const discountAmount = (course.price * coupon_exist.discountValue) / 100;
      price = course.price - discountAmount;
    } else {
      price = course.price - coupon_exist.discountValue;
    }
    req.session.pricing = {
      courseId,
      couponId: coupon_exist.id,
      price,
    };

    return {
      original_price: course.price,
      coupon_details: {
        value: coupon_exist.discountValue,
        type: coupon_exist.couponType,
      },
      new_price: price,
    };
  }

  async delete(couponId: number) {
    const coupon = await this.couponRepo.deleteCoupon(couponId);
    if (!coupon) throw new NotFoundException('coupon not found');

    await this.couponRepo.deleteCoupon(couponId);

    return true;
  }
}
