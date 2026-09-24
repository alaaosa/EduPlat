import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseRepository } from '../repo/course.repo';
import { UserRepository } from 'src/user/repo/user';
import { EnrollDto } from './dto/enrollment.dto';
import { EnrollmentRepository } from './repo/enrollment.repo';
import { EnrollmentTypes } from '../shared/enum/enrollment.enum';
import { CouponService } from '../coupon/coupon.service';
import { OnEvent } from '@nestjs/event-emitter';
import { PurchasableTypes } from 'src/payment/enum';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly userRepo: UserRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly couponService: CouponService,
  ) {}

  @OnEvent('payment.course.successfully')
  async enroll(dto: EnrollDto) {
    await this.enrollmentRepository.create(
      dto.itemId,
      dto.userId,
      EnrollmentTypes.COMPELETE,
    );
  }
}
 