import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queueNames } from 'src/common/queue';
import { UserRepository } from './repo/user';
import { Logger } from '@nestjs/common';
import { getUserWorkerMessage } from './handler/job.handler';

@Processor(queueNames.USER, { concurrency: 10 })
export class UserWorker extends WorkerHost {
  private readonly logger = new Logger(UserWorker.name);
  constructor(private readonly userRepository: UserRepository) {
    super();
  }
  async process(job: Job): Promise<any> {
    const userId = job.data.userId as number;
    await this.userRepository.deleteUserPhoto(userId);
  }

  // if there is multi jobs , use job name to show that the event is to this job

  @OnWorkerEvent('completed')
  write_log(job:Job) {
    this.logger.log(getUserWorkerMessage('completed',job.name));
  }

  @OnWorkerEvent('failed')
  write_warn(_job: Job, err: Error) {
    this.logger.error("can't delete the user photo ", err.message);
  }

  @OnWorkerEvent('ioredis:close')
  onRedisClose() {
    this.logger.warn('Worker Redis connection closed');
  }
}
