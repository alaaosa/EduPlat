import { Module } from '@nestjs/common';
import { PaymentService } from '../payment/application/payment.service';
import { PaymentController } from '../payment/presentation/payment.controller';
import { StripeProvider } from 'src/common/utils/stripe';

@Module({
  controllers: [PaymentController],
  providers: [StripeProvider, PaymentService],
  exports: [StripeProvider],
})
export class PaymentModule {}
