import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { userEvents } from 'src/common/events/user.event';
import { NotificationType } from './constants/notification.constants';

@Injectable()
export class NotificationListener {
  constructor(private readonly notificationService: NotificationService) {}
  @OnEvent(userEvents.USER_VERIFICATION)
  async handleUserVerificationEvent(payload: {
    userId: number;
    email: string;
    tokenEmail: string;
  }) {
    await this.notificationService.send({
      userId: payload.userId,
      type: NotificationType.VERIFICATION_EMAIL,
      subject: 'Verify your email',
      // background: false,
      data: {
        email: payload.email,
        body: `
    <h1>Verify Email</h1>

    <a href="${process.env.BASE_URL}/auth/activation/${payload.tokenEmail}">
        Verify
    </a>
`,
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
      subject: 'Enrollment Success',
      data: {
        email: payload.email,
        body: `
       <p> Enrolled Successfully in ${payload.title} </p>
        
        `,
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
      subject: 'Course Review',
      data: {
        email: payload.email,
        body: `Your course ${payload.title} has been reviewed`,
      },
    });
  }
  @OnEvent('course.rejected')
  async handleRejectCourseEvent(payload: {
    instructerId: number;
    email: string;
    title: string;
    reason: string;
  }) {
    await this.notificationService.send({
      userId: payload.instructerId,
      type: NotificationType.COURSE_REJECTED,
      subject: 'Course Rejected',
      data: {
        email: payload.email,
        body: `       
        <p> Your course ${payload.title} has been rejected , the reason is : ${payload.reason} </p>
        <h1> Please check the reason and try again </h1>     
        `,
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
      subject: 'Course Accepted',
      data: {
        email: payload.email,
        body: `Your course ${payload.title} has been accepted and published`,
      },
    });
  }
}
