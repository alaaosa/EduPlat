import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AssessmentService } from '../assessment.service';
import { AttemptRepository } from '../repo/attempt.repo';

/** Repairs missed/delayed queue work from the durable SQL expiry timestamp. */
@Injectable()
export class AssessmentRecoveryService {
  private readonly logger = new Logger(AssessmentRecoveryService.name);

  constructor(
    private readonly attempts: AttemptRepository,
    private readonly assessments: AssessmentService,
  ) {}

  @Interval(60_000)
  async recoverExpiredAttempts() {
    const expired = await this.attempts.findExpiredInProgress(new Date());
    await Promise.all(
      expired.map(async (attempt) => {
        try {
          await this.assessments.expireAttempt(
            attempt.id,
            attempt.assessmentId,
            { id: attempt.userId, name: '' },
            attempt.examType,
          );
        } catch (error) {
          this.logger.error(`Could not recover expired attempt `, error as Error);
        }
      }),
    );
  }
}
