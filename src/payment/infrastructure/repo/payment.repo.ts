import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from '../models/payment.model';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes, Op, Sequelize } from 'sequelize';
import { PaymentEntity } from 'src/payment/domain/entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel(Payment)
    private readonly paymentModel: typeof Payment,
    private readonly exceptionHandler: HandleException,
  ) {}

  create(data: Omit<CreationAttributes<Payment>, ''>) {
    return this.exceptionHandler.handle(async () =>
      this.paymentModel.create(data),
    );
  }

  // to get the total payout of instructer
  findPayOutOfInstructer(instructorId: number) {
    return this.exceptionHandler.handle(async () =>
      this.paymentModel.sum('amount', {
        where: { instructorId },
      }),
    );
  }

  /**
   * @param instructorId
   * @returns array of objects that contains the total payout of instructer by month and year
   */
  async findPayoutOfInstructorByMonths(instructorId: number) {
    return this.exceptionHandler.handle(async () =>
      this.paymentModel.findAll({
        attributes: [
          [Sequelize.fn('YEAR', Sequelize.col('createdAt')), 'year'],
          [Sequelize.fn('MONTHNAME', Sequelize.col('createdAt')), 'month'],
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount'],
        ],

        group: [
          Sequelize.fn('YEAR', Sequelize.col('createdAt')),
          Sequelize.fn('MONTH', Sequelize.col('createdAt')),
        ],

        order: [
          [Sequelize.fn('YEAR', Sequelize.col('createdAt')), 'ASC'],
          [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'ASC'],
        ],
        raw: true,
      }),
    );
  }

  getTotalEarningsOfInstructer(instructorId: number) {
    return this.exceptionHandler.handle(async () =>
      this.paymentModel.sum('instructor_earnings', {
        where: { instructorId },
      }),
    );
  }

  // get the total earnings to admin dashboard
  getTotalEarnings() {
    return this.exceptionHandler.handle(async () =>
      this.paymentModel.sum('platform_fee'),
    );
  }

  getPaymentDataDomain(userId: number) {
    return this.exceptionHandler.handle(async () => {
      const props = await this.paymentModel.findOne({
        where: { userId },
        attributes: ['userId', 'itemId', 'amount'],
      });
      if (!props) throw new NotFoundException();
      return PaymentEntity.instance(props.userId, props.itemId, props.amount);
    });
  }
}
