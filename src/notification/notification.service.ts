import { BadRequestException, Injectable } from '@nestjs/common';

import { EmailService } from './channels/email/email.service';
import { InAppNotificationService } from './channels/in-app/in-app-notification.service';
import { UserRepository } from 'src/user/repo/user';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  INotificationSetting,
  ISendNotification,
} from './interfaces/notification-channel.interface';
@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly inAppNotificationService: InAppNotificationService,
    private readonly userRepository: UserRepository,
  ) {}

  private async checkSetting(userId: number) {
    let check: INotificationSetting = {};
    const user = await this.userRepository.findSetting(userId);
    if (!user) return;
    if (user.userSetting?.emailNotification) check.emailNotification = true;
    if (user.userSetting?.pushNotification) check.pushNotification = true;

    return check;
  }

  async send(dto: ISendNotification) {
    const setting = await this.checkSetting(dto.userId);
    if (setting?.emailNotification) {
      await this.emailService.send(dto);
    }
    

    if (setting?.pushNotification) {
      await this.inAppNotificationService.createNotification(dto);
    }
  }
}
