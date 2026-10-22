import { Module } from '@nestjs/common';

import { NotificationService } from './notification.service';
import { EmailService } from './channels/email/email.service';
import { InAppNotificationService } from './channels/in-app/in-app-notification.service';
import { EmailProvider } from '../common/providers/email.provider';
import { NotificationInAppRepository } from './channels/in-app/repo/in.app';
import { NotificationGateway } from './channels/in-app/notification.gw';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationEntity } from './channels/in-app/entity/notification.entity';
import { NotificationListener } from './notification.listener';
import { EmailWorker } from './channels/email/email.processor';

@Module({
  imports: [SequelizeModule.forFeature([NotificationEntity])],
  providers: [
    NotificationService,
    EmailService,
    NotificationListener,
    EmailWorker,
    EmailProvider,
    InAppNotificationService,
    NotificationInAppRepository,
    NotificationGateway,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
