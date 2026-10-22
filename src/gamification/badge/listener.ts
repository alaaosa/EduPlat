import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { queueNames } from 'src/common/queue';
import { BadgeEventType, BadgeQueueNames } from '../shared/enum/badge.enums';
import { ExamTypes } from 'src/assessment/domain/enum/types-of-exam';

@Injectable()
export class BadgeEventListener {
  constructor(
    @InjectQueue(queueNames.BADGE) private readonly badgeQueue: Queue,
  ) {}
  @OnEvent('attempt.graded')
  async finishCourse(payload: {
    attemptId: number;
    userId: number;
    score: number;
    type: ExamTypes;
    assessmentId: number;
  }) {
    if (payload.type !== ExamTypes.FINAL) return;

    this.badgeQueue.add(
      BadgeQueueNames.COURSE_COMPLETED,
      {
        eventType: BadgeEventType.COURSE_COMPLETED,
        userId: payload.userId,
      },
      {
        jobId: `${BadgeQueueNames.COURSE_COMPLETED}:${payload.assessmentId}:${payload.userId}`,
      },
    );
  }
}
