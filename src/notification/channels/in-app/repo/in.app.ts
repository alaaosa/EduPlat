import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HandleException } from 'src/db/db.service';
import { NotificationEntity } from '../entity/notification.entity';

@Injectable()
export class NotificationInAppRepository {
  constructor(
    private handleException: HandleException,

    @InjectModel(NotificationEntity)
    private notificationModel: typeof NotificationEntity,
  ) {}

  create(data: Partial<NotificationEntity>) {
    return this.handleException.handle(async () => {
      return this.notificationModel.create(data);
    });
  }
}
