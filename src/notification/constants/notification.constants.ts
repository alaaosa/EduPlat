export const notificationChannels = {
  EMAIL: 'email',
  PUSH: 'push',
  IN_APP: 'in_app',
  SMS: 'sms',
} as const;

export enum NotificationType {
  VERIFICATION_EMAIL= 'verification',
};
