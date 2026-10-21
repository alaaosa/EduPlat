import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  Query,
  ParseIntPipe,
  type RawBodyRequest,
} from '@nestjs/common';
import { PaymentService } from '../application/payment.service';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import type { Request, Response } from 'express';
import { PurchasableTypes } from '../domain/enum/purchasable-types.enum';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Auth(UserRoles.USER)
  @Post('payment/:type/:id')
  createPayment(
    @Param('id', ParseIntPipe) id: number,
    @Param('type') type: PurchasableTypes,
    @Req() req: Request,
  ) {
    return this.paymentService.createPayment(id, req, type);
  }

  @Auth(UserRoles.INSTRUCTOR)
  @Get('stripe/connect')
  connectStripe(@Req() req: Request, @Res() res: Response) {
    const instructorId = String(req.user.id);

    const url =
      'https://connect.stripe.com/oauth/authorize' +
      `?response_type=code` +
      `&client_id=${process.env.STRIPE_CLIENT_ID}` +
      `&scope=read_write` +
      `&state=${instructorId}` +
      `&redirect_uri=${encodeURIComponent(
        `${process.env.BASE_URL}/stripe/callback`,
      )}`;
    return res.redirect(url);
  }

  @Get('stripe/callback')
  async getAccountInfo(
    @Query('code') code: string,
    @Query('state') instructerId: string,
  ) {
    return this.paymentService.authToken(code, Number(instructerId));
  }

  @Post('stripe/webhook')
  async getWebHook(@Req() req: RawBodyRequest<Request>) {
    const payload = req.rawBody as Buffer;
    const signture = req.headers['stripe-signature'] as string;
    return this.paymentService.webHook(signture, payload);
  }
}
