import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { queueNames } from 'src/common/queue';
import {
  BadgeEventType,
  BadgeQueueNames,
} from '../../gamification2/domain/shared/enum/badge.enums';
import { payloadDTO } from '../../gamification2/presentation/dto/quest';
import {
  QuestEventNames,
  QuestJobNames,
} from '../../gamification2/domain/shared/enum/quest.enum';

@Injectable()
export class QuestEventListener {
  constructor(
    @InjectQueue(queueNames.QUEST) private readonly badgeQueue: Queue,
  ) {}
  @OnEvent('attempt.graded')
  async finishCourse(payload: payloadDTO) {
    if (payload.score < 0.8) return;

    this.badgeQueue.add(
      QuestJobNames.QUIZ_MASTER,
      {
        ...payload,
        eventType: QuestEventNames.QUIZ_MASTER,
      },
      {
        jobId: `${QuestJobNames.QUIZ_MASTER}:${payload.assessmentId}:attempt:${payload.attemptId}`,
      },
    );
  }
}
