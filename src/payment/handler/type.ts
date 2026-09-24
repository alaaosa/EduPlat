import { Request } from 'express';
import { PurchasableTypes } from '../enum';
import { CheckoutService } from 'src/checkout/checkout.service';
import { Injectable } from '@nestjs/common';
import EventEmitter2 from 'eventemitter2';

@Injectable()
export class PaymentHandler {
  constructor(private readonly checkoutService: CheckoutService) {}

  private readonly paymentType: Record<
    PurchasableTypes,
    (id: number, req: Request) => Promise<any>
  > = {
    [PurchasableTypes.COURSE]: (id, req) =>
      this.checkoutService.courseCheckOut(id, req),
  };

  getData(id: number, req: Request, type: PurchasableTypes) {
    return this.paymentType[type](id, req);
  }
}
