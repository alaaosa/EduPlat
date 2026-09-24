import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import type { Request } from 'express';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('course/:courseId')
  courseCheckOut(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: Request,
  ) {
    return this.checkoutService.courseCheckOut(courseId, req);
  }
}
