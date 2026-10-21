import { PurchasableTypes } from 'src/payment/domain/enum/purchasable-types.enum';
import { PaymentDomainError } from './err/err';

export type DataCourse = {
  courseId: number;
  price: number;
  instructerId: number;
  stripeAccountId: number;
};

export type paymentObject = {
  application_fee_amount: number;
  transfer_data?: {
    destination: string;
  };
};

export class PaymentEntity {
  private constructor(
    public readonly userId: number,
    public readonly itemId: number,
    public readonly amount: number,
  ) {}

  static instance(userId: number, itemId: number, amount: number) {
    if (!userId || !itemId || amount < 0)
      throw new PaymentDomainError("can't make instance from Payment");
    return new PaymentEntity(userId, itemId, amount);
  }

  calcPlatformFee(rate: number) {
    const fee = rate * this.amount;
    return fee;
  }

  checkPaymentInformationForCourse(props: DataCourse) {
    if (
      !props.courseId ||
      !props.instructerId ||
      !props.stripeAccountId ||
      !props.price
    )
      throw new PaymentDomainError('payment error on fields');
  }

  private paymentIntendRecord: Record<
    PurchasableTypes,
    (id: string) => paymentObject
  > = {
    [PurchasableTypes.COURSE]: (id: string) => ({
      application_fee_amount: this.calcPlatformFee(0.3),
      transfer_data: {
        destination: id,
      },
    }),
  };

  paymentIntentData(type: PurchasableTypes, stripeAccountId: string) {
    const paymentIntent = this.paymentIntendRecord[type];

    if (!paymentIntent) throw new PaymentDomainError('payment error on intent');

    const data = paymentIntent(stripeAccountId);

    return data;
  }
}
