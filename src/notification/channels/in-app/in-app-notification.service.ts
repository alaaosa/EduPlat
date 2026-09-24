import { Injectable } from '@nestjs/common';
import { SendNotificationDto } from 'src/notification/dto/send-notification.dto';
import { NotificationInAppRepository } from './repo/in.app';
import { NotificationGateway } from './notification.gw';

@Injectable()
export class InAppNotificationService {
  constructor(
    private notificationRepo: NotificationInAppRepository,
    private notificationGateWay: NotificationGateway,
  ) {}

  async createNotification(dto: any) {
    const notification = await this.notificationRepo.create(dto);

    this.notificationGateWay.sendNotification(dto.userId, notification);
  }
}
