import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InstructerBilling } from '../../instructer/entities/instructer.billing';
import { CreationAttributes } from 'sequelize';
import { HandleException } from 'src/db/db.service';
type createBilling = Omit<CreationAttributes<InstructerBilling>, ''>;
@Injectable()
export class InstructerRepository {
  constructor(
    private readonly exceptionhandler: HandleException,
    @InjectModel(InstructerBilling)
    private readonly instructer_model: typeof InstructerBilling,
  ) {}

  create(data: createBilling) {
    return this.exceptionhandler.handle(async () =>
      this.instructer_model.create(data),
    );
  }
}
