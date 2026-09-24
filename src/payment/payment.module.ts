import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { StripeProvider } from 'src/common/utils/stripe';

@Module({
  controllers: [PaymentController],
  providers: [StripeProvider, PaymentService],
  exports: [StripeProvider],
})
export class PaymentModule {}
