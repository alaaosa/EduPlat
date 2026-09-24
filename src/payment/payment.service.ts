import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { CheckoutService } from 'src/checkout/checkout.service';
import { InstructerRepository } from 'src/user/repo/instructer';
import type { Event, Stripe } from 'stripe';
import { PurchasableTypes } from './enum';
import { PaymentHandler } from './handler/type';
import EventEmitter2, { event } from 'eventemitter2';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly instructerRepo: InstructerRepository,
    private readonly checkoutService: CheckoutService,
    private readonly paymentHandler: PaymentHandler,
    private readonly eventEmmiter2: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  async authToken(code: string, instructerId: number) {
    const res = await this.stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    await this.instructerRepo.create({
      instructerId,
      stripeAccountId: res.stripe_user_id!,
    });
  }

  async createPayment(id: number, req: Request, type: PurchasableTypes) {
    const item = await this.paymentHandler.getData(id, req, type);

    if (!item) throw new NotFoundException("can't fetch data");

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],

      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.title,
            },

            unit_amount: item.price * 100,
          },
          quantity: 1,
        },
      ],

      success_url: `https://facebook.com`,
      cancel_url: `https://google.com`,

      client_reference_id: String(req['user'].id),

      metadata: {
        title: item.title,
        itemId: item.id,
        type,
        email: req['user'].email,
      },
    });

    return {
      id: session.id,
      url: session.url,
    };
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

    if (event.type !== 'checkout.session.completed') {
      return { received: true };
    }

    const session = event.data.object;

    if (session.payment_status !== 'paid') {
      return { received: true };
    }
    const { type, title, email, itemId } = session.metadata!;
    const userId = Number(session.client_reference_id);

    await this.redisService.client
      .set(
        `enrolled:${userId.toString()}:${itemId.toString()}`,
        JSON.stringify(true),
        'EX',
        7 * 24 * 60 * 60,
      )
      .catch((err) => {
        this.logger.error("can't write in cache");
      }); // set userId in redis for 7 days

    this.eventEmmiter2.emit(`payment.${type}.successfully`, {
      title,
      email,
      type,
      userId,
      itemId, // string here
    });
  }
}
