import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { userEvents } from 'src/common/events/user.event';
import { NotificationType } from './constants/notification.constants';
import { emit } from 'process';

@Injectable()
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

  @OnEvent('payment.course.successfully')
  async handleUserEnrollmentSuccessfully(payload: {
    title: string;
    email: string;
    userId: number;
  }) {
    await this.notificationService.send({
      userId: payload.userId,
      type: NotificationType.ENROLLMENT_SUCCESS,
      data: {
        email: payload.email,
        body: `Enrolled Successfully in ${payload.title}`,
      },
    });
  }

  @OnEvent('course.review')
  async handleReviewCourseEvent(payload: {
    instructorId: number;
    email: string;
    title: string;
  }) {
    await this.notificationService.send({
      userId: payload.instructorId,
      type: NotificationType.COURSE_REVIEW,
      data: {
        email: payload.email,
        title: payload.title,
      },
    });
  }
  @OnEvent('course.rejected')
  async handleRejectCourseEvent(payload: {
    instructerId: number;
    email: string;
    title: string;
  }) {
    await this.notificationService.send({
      userId: payload.instructerId,
      type: NotificationType.COURSE_REJECTED,
      data: {
        email: payload.email,
        title: payload.title,
      },
    });
  }
  @OnEvent('course.published')
  async handleAcceptCourseEvent(payload: {
    instructerId: number;
    email: string;
    title: string;
  }) {
    await this.notificationService.send({
      userId: payload.instructerId,
      type: NotificationType.COURSE_accepted,
      data: {
        email: payload.email,
        title: payload.title,
      },
    });
  }
}
