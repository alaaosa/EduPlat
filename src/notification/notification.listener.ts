import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { userEvents } from 'src/common/events/user.event';
import { NotificationType } from './constants/notification.constants';

export class NotificationListener {
  constructor(private readonly notificationService: NotificationService) {}
  @OnEvent(userEvents.USER_VERIFICATION)
  async handleUserVerificationEvent(event: {
    userId: number;
    email: string;
    tokenEmail: string;
  }) {
    await this.notificationService.send({
      userId: event.userId,
      type: NotificationType.VERIFICATION_EMAIL,
      // background: false,
      data: {
        email: event.email,
        tokenEmail: event.tokenEmail,
      },
    });
  }
}
