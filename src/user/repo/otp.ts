import { Injectable } from '@nestjs/common';
import { HandleException } from 'src/db/db.service';
import { InjectModel } from '@nestjs/sequelize';
import { OTP } from '../entities/otp.entity';
import { CreationAttributes, Transaction } from 'sequelize';
import { Op } from 'sequelize';
@Injectable()
export class OTPRepository {
  constructor(
    private handleException: HandleException,
    @InjectModel(OTP) private readonly otpModel: typeof OTP,
  ) {}

  create(
    otp: Omit<CreationAttributes<OTP>, 'userId'>,
    userId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.otpModel.create({ ...otp, userId }, { transaction });
    });
  }

  get(userId: number) {
    return this.handleException.handle(async () => {
      return this.otpModel.findOne({
        where: { userId },
        attributes: ['otp', 'expiresAt'],
        order: [['createdAt', 'DESC']],
      });
    });
  }

  delSpecificOtp(otp: string, userId: number) {
    return this.handleException.handle(async () => {
      return this.otpModel.destroy({ where: { otp, userId } });
    });
  }

  verifyEmail(userId: number) {
    return this.handleException.handle(async () => {
      return this.otpModel.findOne({
        where: { userId },
        attributes: ['otp', 'expiresAt', 'isUsed'],
        order: [['createdAt', 'DESC']],
      });
    });
  }

  deleteExpired() {
    return this.handleException.handle(async () =>
      this.otpModel.destroy({
        where: {
          [Op.or]: [
            { isUsed: true },
            {
              expiresAt: {
                [Op.lt]: new Date(),
              },
            },
          ],
        },
      }),
    );
  }
}
