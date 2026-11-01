import { NotificationType } from '../constants/notification.constants';

export interface INotificationSetting {
  emailNotification?: boolean;
  pushNotification?: boolean;
}

export interface ISendNotification<T = {  email: string; body : string }> {
  userId: number;
  type: NotificationType;
  subject : string;
  data: T;
}
