export const notificationChannels = {
  EMAIL: 'email',
  PUSH: 'push',
  IN_APP: 'in_app',
  SMS: 'sms',
} as const;

export enum NotificationType {
  VERIFICATION_EMAIL = 'verification',
  ENROLLMENT_SUCCESS = 'enroll.success',
  COURSE_REVIEW = 'course.review',
  COURSE_accepted = 'course.accepted',
  COURSE_REJECTED = 'course.rejected',
}
