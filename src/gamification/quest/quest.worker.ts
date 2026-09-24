import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queueNames } from 'src/common/queue';
import { QuestRepository } from './repo/quest.repo';
import { Logger } from '@nestjs/common';

@Processor(queueNames.QUEST, { concurrency: 1 })
export class QuestWorker extends WorkerHost {
  constructor(
    private readonly questRepository: QuestRepository,
    private readonly logger = new Logger(QuestWorker.name),
  ) {
    super();
  }
  async process(job: Job, token?: string): Promise<any> {
    const { eventType, userId } = job.data;

    const quests = await this.questRepository.findQuests(eventType);

    if (!quests || quests.length == 0) {
      this.logger.warn('worker can not deal with quests');
      return;
    }

    quests.map(
      async ({ id }) =>
        await this.questRepository.incrementUserQuestProgress(userId, id),
    );
  }
}
