import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { paymentObject } from 'src/payment/domain/entity';
import { PurchasableTypes } from 'src/payment/domain/enum/purchasable-types.enum';
import type { Event, Stripe } from 'stripe';

@Injectable()
export class StripeGateway {
  private readonly logger = new Logger(StripeGateway.name);
  constructor(@Inject('STRIPE') private readonly stripe: Stripe) {}

  async checkAccountCapability(stripeAccountId: string): Promise<boolean> {
    const account = await this.stripe.accounts
      .retrieve(stripeAccountId)
      .catch((err) => {
        throw new BadGatewayException(err.message);
      });

    return account.charges_enabled && account.payouts_enabled;
  }

  async authToken(code: string): Promise<string | undefined> {
    const res = await this.stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });
    return res.stripe_user_id;
  }
  async create(
    data: { title: string; price: number; id: number; ownerId: number },
    type: PurchasableTypes,
    payment_intent_data: paymentObject,
    userData: { userId: number; email: string },
  ) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_creation: 'always',
        customer_email: userData.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: data.title,
              },
              unit_amount: data.price,
            },
            quantity: 1,
          },
        ],
        payment_intent_data,

        success_url: `https://facebook.com`,
        cancel_url: `https://google.com`,
        client_reference_id: String(userData.userId),
        metadata: {
          title: data.title,
          itemId: data.id,
          type,
          email: userData.email,
          instructorId: type === PurchasableTypes.COURSE ? data.ownerId : null,
        },
      });

      return {
        id: session.id,
        url: session.url,
      };
    } catch (err: any) {
      this.logger.error(err.message);
    }
  }

  async webHook(signature: string, payload: Buffer) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    let event: Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret,
      );
    } catch (err: any) {
      throw new BadRequestException(`WebHook Exception ${err.message}`);
    }

    return event;
  }
}
