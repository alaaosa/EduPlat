import { Module } from '@nestjs/common';
import { PaymentService } from '../payment/application/payment.service';
import { PaymentController } from '../payment/presentation/payment.controller';
import { StripeProvider } from 'src/common/utils/stripe';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './infrastructure/models/payment.model';
import { PaymentRepository } from './infrastructure/repo/payment.repo';
import { PaymentHandler } from './infrastructure/mapper/get-data-to-payment';
import { StripeGateway } from './infrastructure/stripe/stripe.payment.gateway';
import { InstructerModule } from '../instructer/instructer.module';
import { CheckoutModule } from '../checkout/checkout.module';
import { HandleException } from '../db/db.service';

@Module({
  imports: [SequelizeModule.forFeature([Payment]), InstructerModule, CheckoutModule],
  controllers: [PaymentController],
  providers: [StripeProvider, PaymentService, PaymentRepository, PaymentHandler, StripeGateway, HandleException],
  exports: [StripeProvider, StripeGateway],
})
export class PaymentModule {}
