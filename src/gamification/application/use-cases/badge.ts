import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeEventType } from 'src/gamification/domain/shared/enum/badge.enums';
import type { IBadge } from 'src/gamification/domain/shared/interfaces/badge';

@Injectable()
export class CompleteCourse {
  constructor(@Inject('IBadge') private readonly badgeQueue: IBadge) {}

  @OnEvent('exam.final.graded')
  async finishFirstCourse(payload: {
    idempotency_key: string;
    userId: number;
    isPassed: boolean;
  }) {
    if (!payload.isPassed) return;

    await this.badgeQueue.addBadgeJob(
      payload.userId,
      BadgeEventType.COURSE_COMPLETED,
      payload.idempotency_key,
    );
  }
}
