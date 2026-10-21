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
import { PurchasableTypes } from '../domain/enum/purchasable-types.enum';
import { PaymentHandler } from '../infrastructure/mapper/get-data-to-payment';
import EventEmitter2, { event } from 'eventemitter2';
import { RedisService } from 'src/redis/redis.service';
import { PaymentRepository } from '../infrastructure/repo/payment.repo';
import { InstructerRepository } from 'src/instructer/repo/instructor';
import { PaymentEntity } from 'src/payment/domain/entity';
import { StripeGateway } from 'src/payment/infrastructure/stripe/stripe.payment.gateway';

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
    private readonly stripeGateway: StripeGateway,
  ) {}

  async authToken(code: string, instructerId: number) {
    const stripeAccountId = await this.stripeGateway.authToken(code);
    if (!stripeAccountId)
      throw new BadGatewayException('Payment provider error');
    await this.instructerRepo.createAccountId(instructerId, stripeAccountId);
  }

  async createPayment(id: number, req: Request, type: PurchasableTypes) {
    const item = await this.paymentHandler.getData(id, req, type);

    if (!item) throw new NotFoundException("can't fetch data");

    const payment_domain = PaymentEntity.instance(
      req.user.id,
      item.id,
      item.price,
    );
    payment_domain.checkPaymentInformationForCourse({
      courseId: item.id,
      instructerId: item.ownerId,
      stripeAccountId: item.stripeAccountId,
      price: item.price,
    });
    const canRecieve = await this.stripeGateway.checkAccountCapability(
      item.stripeAccountId,
    );
    if (!canRecieve) throw new ForbiddenException();
    const payment_intent_data = payment_domain.paymentIntentData(
      type,
      item.stripeAccountId,
    );

    const session = await this.stripeGateway.create(
      item,
      type,
      payment_intent_data,
      { userId: req.user.id, email: req.user.email },
    );

    return session;
  }

  async webHook(
    signature: string,
    payload: Buffer,
  ): Promise<{ received: boolean } | undefined> {
    const event = await this.stripeGateway.webHook(signature, payload);
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
