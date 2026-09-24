import { NotificationType } from '../constants/notification.constants';

export interface INotificationSetting {
  emailNotification?: boolean;
  pushNotification?: boolean;
}

export interface ISendNotification<T = unknown> {
  userId: number;
  type: NotificationType;
  data: T;
}
