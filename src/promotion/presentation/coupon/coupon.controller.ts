import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseFilters,
} from '@nestjs/common';
import { CouponService } from '../../application/coupon.service';
import { CouponUserDTO, CreateCouponDTO } from './dto/coupon.dto';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import type { Request } from 'express';
import { CouponExceptionFilter } from 'src/promotion/domain/err/exception';

@UseFilters(CouponExceptionFilter)
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Auth(UserRoles.INSTRUCTOR)
  @Post('course/:courseId')
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateCouponDTO,
    @Req() req: Request,
  ) {
    return this.couponService.create(courseId, dto, req.user.id);
  }

  @Post('course/:courseId/validate')
  validateCoupon(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CouponUserDTO,
    @Req() req: Request,
  ): Promise<unknown> {
    return this.couponService.validateCoupon(dto.coupon, courseId, req.session);
  }

  @Auth(UserRoles.INSTRUCTOR)
  @Delete(':couponId')
  delete(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Req() req: Request,
  ) {
    return this.couponService.delete(couponId, req.user.id);
  }
}
