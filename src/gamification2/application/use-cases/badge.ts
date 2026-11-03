import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeEventType } from 'src/gamification2/domain/shared/enum/badge.enums';
import type { IBadge } from 'src/gamification2/domain/shared/interfaces/badge';

@Injectable()
export class CompleteCourse {
  constructor(@Inject('IBadge') private readonly badgeQueue: IBadge) {}

  @OnEvent('exam.final.graded')
  async finishFirstCourse(payload: {
    idempotency_key: string;
    userId: number;
  }) {
    await this.badgeQueue.addBadgeJob(
      payload.userId,
      BadgeEventType.COURSE_COMPLETED,
      payload.idempotency_key,
    );
  }

  @OnEvent('exam.quiz.graded')
  async finishQuiz(payload: {
    idempotency_key: string;
    userId: number;
  }) {
    await this.badgeQueue.addBadgeJob(
      payload.userId,
      BadgeEventType.COURSE_COMPLETED,
      payload.idempotency_key,
    );
  }
}
