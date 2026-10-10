import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TempUser } from '../entities/temp-user';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class TempUserRepository {
  constructor(
    private readonly exceptionHandler: HandleException,
    @InjectModel(TempUser) private readonly tempUserModel: typeof TempUser,
  ) {}

  create(tempUser: Omit<CreationAttributes<TempUser>, 'id'>) {
    return this.exceptionHandler.handle(async () => {
      return this.tempUserModel.create(tempUser);
    });
  }
}
