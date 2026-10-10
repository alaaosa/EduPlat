import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import type { Event, Stripe } from 'stripe';
import { PurchasableTypes } from './enum';
import { PaymentHandler } from './handler/type';
import EventEmitter2, { event } from 'eventemitter2';
import { RedisService } from 'src/redis/redis.service';
import { PaymentRepository } from './repo/payment.repo';
import { InstructerRepository } from 'src/instructer/repo/instructor';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly instructerRepo: InstructerRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentHandler: PaymentHandler,
    private readonly eventEmmiter2: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  async authToken(code: string, instructerId: number) {
    const res = await this.stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });
    const stripeAccountId = res.stripe_user_id;

    if (!stripeAccountId)
      throw new BadGatewayException('Payment provider error');

    await this.instructerRepo.createAccountId(instructerId, stripeAccountId);
  }

  // check cabapility of instructer to receive payment
  async checkInstructerCapability(instructerId: number) {
    const instructer =
      await this.instructerRepo.getAccountIdByInstructerId(instructerId);
    if (!instructer) throw new NotFoundException('Instructer not found');
    const account = await this.stripe.accounts
      .retrieve(instructer.stripeAccountId)
      .catch((err) => {
        throw new NotFoundException('Instructer not found : ', err.message);
      });

    if (!account.charges_enabled || !account.payouts_enabled)
      throw new ForbiddenException(
        'your account is not enabled to receive payments, please check your stripe account',
      );
  }

  async createPayment(id: number, req: Request, type: PurchasableTypes) {
    const item = await this.paymentHandler.getData(id, req, type);

    if (!item) throw new NotFoundException("can't fetch data");

    if (type === PurchasableTypes.COURSE)
      if (!item.instructorId)
        throw new BadRequestException(
          'instructerId is required for course payment',
        );
    await this.checkInstructerCapability(item.instructorId);
    const finalPrice = Math.round(item.price * 100);
    const applicationFee = Math.floor(finalPrice * 100 * 0.2);
    const payment_intent_data =
      type === PurchasableTypes.COURSE
        ? {
            application_fee_amount: applicationFee,
            transfer_data: {
              destination: item.instructer.stripeAccountId,
            },
          }
        : {
            application_fee_amount: finalPrice,
          };

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_creation: 'always',
      customer_email: req.user.email,
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

      payment_intent_data,

      success_url: `https://facebook.com`,
      cancel_url: `https://google.com`,
      client_reference_id: String(req.user.id),
      metadata: {
        title: item.title,
        itemId: item.id,
        type,
        email: req.user.email,
        instructorId:
          type === PurchasableTypes.COURSE ? item.instructorId : null,
      },
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  async webHook(
    signature: string,
    payload: Buffer,
  ): Promise<{ received: boolean } | undefined> {
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

    // 'completed' here , because we use payment method 'card'
    if (event.type !== 'checkout.session.completed') {
      return { received: true };
    }

    const session = event.data.object;

    if (session.payment_status !== 'paid') {
      return { received: true };
    }
    const { type, title, email, itemId, instructorId } = session.metadata!;
    const userId = Number(session.client_reference_id);

    if (!session.payment_intent) {
      throw new BadRequestException(
        'PaymentIntent is missing from Checkout Session',
      );
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      session.payment_intent as string,
    );

    if (paymentIntent.status !== 'succeeded') {
      return { received: true };
    }

    const chargeId = paymentIntent.latest_charge;

    if (!chargeId)
      throw new BadRequestException('Charge is missing from PaymentIntent');

    const charge = await this.stripe.charges.retrieve(chargeId as string);

    const grossAmount = charge.amount;

    const platformFee = paymentIntent.application_fee_amount ?? 0;

    let stripe_fee = 0;

    if (charge.balance_transaction) {
      const balanceTransaction = await this.stripe.balanceTransactions.retrieve(
        charge.balance_transaction as string,
      );

      stripe_fee = balanceTransaction.fee;
    }

    const instructorEarnings =
      type === PurchasableTypes.COURSE ? grossAmount - platformFee : 0;

    if (type === PurchasableTypes.COURSE) {
      if (!instructorId)
        throw new BadRequestException(
          'instructerId is required for course payment',
        );

      await this.paymentRepository.create({
        itemId: Number(itemId),
        userId,
        type,
        status: 'paid',
        instructor_earnings: instructorEarnings,
        stripe_fee,
        platform_fee: platformFee,
        instructorId: Number(instructorId),
        amount: grossAmount,
        stripePaymentIntentId: paymentIntent.id,
      });
    }

    this.eventEmmiter2.emit(`payment.${type}.successfully`, {
      title,
      email,
      type,
      userId,
      itemId, // string here
    });

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
  }
}
