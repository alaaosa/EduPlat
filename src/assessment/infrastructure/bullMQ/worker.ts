import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import EventEmitter2 from 'eventemitter2';
import { queueNames } from 'src/common/queue';
import { AttemptRepository } from '../repo/attempt';
import { AttemptStatus } from 'src/assessment/domain/enum/attempt';

@Processor(queueNames.EXAM)
export class ExamWorker extends WorkerHost {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly attemptRepository: AttemptRepository,
  ) {
    super();
  }
  async process(job: Job): Promise<any> {
    const { userId, attemptId } = job.data;

    this.eventEmitter.emit('exit-exam', { userId, attemptId });

    await this.attemptRepository.updateAttemptStatus(
      attemptId,
      AttemptStatus.EXPIRED,
    );
  }
}
