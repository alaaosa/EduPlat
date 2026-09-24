import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queueNames } from 'src/common/queue';
import { AssessmentService } from '../assessment.service';
import { examType } from '../models/MCQ&TF/question';

@Processor(queueNames.ASSESSMENT, { concurrency: 5 })
export class AssessmentWorker extends WorkerHost {
  constructor(private readonly assessmentService: AssessmentService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== 'expired_time') return;

    const { assessmentId, attemptId, user, type } = job.data as {
      assessmentId: number;
      attemptId: number;
      user: { id: number; name: string };
      type: examType;
    };
    await this.assessmentService.expireAttempt(attemptId, assessmentId, user, type);
  }
}
