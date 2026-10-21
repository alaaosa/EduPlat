import { CouponType } from 'src/learning/course/domain/enums/coupon.enum';
import { InvalidCouponError } from '../err/coupon';

export class CouponEntity {
  constructor(
    private coupon: string,
    public readonly courseId: number,
    private endsAt: Date,
    // public readonly id: number,
    private currentUsage: number,
    private maxUsage: number,
    private couponType: CouponType,
    private discountValue: number,
  ) {}

  canApply(courseId: number) {
    if (this.courseId !== courseId)
      throw new InvalidCouponError('Coupon is not valid for this course');
    const date = new Date(this.endsAt).getTime();

    if (date < Date.now()) throw new InvalidCouponError('Coupon has expired');
    if (this.currentUsage >= this.maxUsage)
      throw new InvalidCouponError('Coupon usage limit has been reached');
  }

  static instance(data: {
    coupon: string;
    courseId: number;
    endsAt: Date;
    currentUsage: number;
    maxUsage: number;
    couponType: CouponType;
    discountValue: number;
  }) {
    return new CouponEntity(
      data.coupon,
      data.courseId,
      data.endsAt,
      data.currentUsage,
      data.maxUsage,
      data.couponType,
      data.discountValue,
    );
  }

  create() {
    if (
      !this.couponType ||
      !this.discountValue ||
      !this.coupon ||
      !this.courseId ||
      !this.maxUsage ||
      this.currentUsage < 0 ||
      !this.endsAt
    )
      throw new InvalidCouponError('Coupon details are invalid');
    const date = new Date(this.endsAt).getTime();
    if (date < Date.now()) throw new InvalidCouponError('Coupon has expired');
    if (
      this.couponType == CouponType.FIXED &&
      (this.discountValue < 0 || !Number.isSafeInteger(this.discountValue))
    )
      throw new InvalidCouponError('Coupon discount value is invalid');
    if (
      this.couponType == CouponType.PRECENTAGE &&
      (this.discountValue < 0 || this.discountValue > 70)
    )
      throw new InvalidCouponError('Coupon discount value is invalid');
  }

  calcDiscount(price: number) {
    let new_price: number = 0;
    if (this.couponType == CouponType.PRECENTAGE) {
      const discountAmount = (price * this.discountValue) / 100;
      new_price = price - discountAmount;
    }

    if (this.couponType == CouponType.FIXED) {
      if (price < this.discountValue)
        throw new InvalidCouponError('Coupon discount exceeds the price');

      new_price = price - this.discountValue;

      const platform_earning = 0.3 * price;

      if (new_price < platform_earning)
        throw new InvalidCouponError('Coupon discount is too large');
    }

    return new_price;
  }
}
