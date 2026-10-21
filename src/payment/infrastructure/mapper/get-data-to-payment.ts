import { Request } from 'express';
import { PurchasableTypes } from '../../domain/enum/purchasable-types.enum';
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

  async getData(id: number, req: Request, type: PurchasableTypes) {
    const data = await this.paymentType[type](id, req);

    return {
      price: data.price,
      id: data.id,
      ownerId: type === PurchasableTypes.COURSE ? data.instructorId : null,
      stripeAccountId: data.stripeAccountId,
      title: data.title,
    };
  }
}
