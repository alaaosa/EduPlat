import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CouponController } from './presentation/coupon/coupon.controller';
import { CouponService } from './application/coupon.service';
import { CouponRepository } from './infrastructure/prese/repo/coupon.repo.imp';
import { Coupon } from './infrastructure/prese/models/coupon/coupon.model';
import { CouponUser } from './infrastructure/prese/models/coupon/coupon.user';
import { HandleException } from '../db/db.service';
import { CourseProgressModule } from '../learning/course/course-progress.module';
import { CouponExceptionFilter } from './domain/err/exception';

@Module({
  imports: [SequelizeModule.forFeature([Coupon, CouponUser]), CourseProgressModule],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository, HandleException, CouponExceptionFilter],
})
export class PromotionModule {}
