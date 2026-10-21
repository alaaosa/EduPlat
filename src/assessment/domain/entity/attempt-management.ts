import { AttemptStatus } from '../enum/attempt';
import { AssessmentDomainError } from '../err/domain.err';

export class AttemptEntity {
  private constructor(
    public readonly examId: number,
    public readonly startedAt: Date,
    public readonly expiresAt: Date,
    private status: AttemptStatus,
  ) {}

  static start(
    examId: number,
    durationMinutes: number,
    now: Date = new Date(),
  ): AttemptEntity {
    if (!Number.isInteger(examId) || examId <= 0) {
      throw new AssessmentDomainError('Invalid exam ID');
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      throw new AssessmentDomainError('Invalid duration');
    }

    const startedAt = new Date(now.getTime());
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60_000);

    return new AttemptEntity(
      examId,
      startedAt,
      expiresAt,
      AttemptStatus.IN_PROGRESS,
    );
  }

  getStatus(): AttemptStatus {
    return this.status;
  }

  complete(): void {
    if (this.status !== AttemptStatus.IN_PROGRESS) {
      throw new AssessmentDomainError('Attempt is not in progress');
    }

    this.status = AttemptStatus.SUBMITTED;
  }

  finlize(now: Date = new Date()): void {
    if (this.status !== AttemptStatus.IN_PROGRESS) {
      throw new AssessmentDomainError('Attempt is not in progress');
    }

    if (now.getTime() < this.expiresAt.getTime()) {
      throw new AssessmentDomainError('Attempt has not expired yet');
    }

    this.status = AttemptStatus.EXPIRED;
  }
}
