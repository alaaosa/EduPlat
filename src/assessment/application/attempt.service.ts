import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttemptRepository } from '../infrastructure/repo/attempt';
import { ExamRepository } from '../infrastructure/repo/exam.repo';
import { Ownership } from '../domain/policy/ownership';
import { EnrollmentRepository } from 'src/enrollment/repo/enrollment.repo';
import { stat } from 'fs';
import { AttemptStatus } from '../domain/enum/attempt';
import { StudentAnswerDTO } from '../presentation/dto/student-answer';
import { GradeRepository } from '../infrastructure/repo/grade';
import { ExamWorker } from '../infrastructure/bullMQ/worker';
import { InjectQueue } from '@nestjs/bullmq';
import { queueNames } from 'src/common/queue';
import { Queue } from 'bullmq';

@Injectable()
export class AttemptService {
  private readonly logger = new Logger(AttemptService.name);
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly examRepository: ExamRepository,
    @InjectQueue(queueNames.EXAM) private readonly examQueue: Queue,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  // DON'T FORGET USE lESSONGUARD
  async start(examId: number, userId: number) {
    const exam = await this.examRepository.findByExamId(examId);

    if (!exam) throw new NotFoundException('exam not found');

    const startedAt = new Date();

    const data = {
      startedAt,
      expiresAt: new Date(startedAt.getTime() + 60_000 * exam.duration),
      status: AttemptStatus.IN_PROGRESS,
    };

    const attempt = await this.attemptRepository.create(data, userId, examId);

    await this.examQueue
      .add(
        'exit-exam',
        { userId, attemptId: attempt.id },
        {
          delay: 1000 * 60 * exam.duration,
          jobId: `exam-${userId}-${attempt.id}`,
        },
      )
      .catch((err) => {
        throw new BadRequestException(err);
      });
    return exam;
  }

  async checkAttempt(attemptId: number, time_of_answer: Date) {
    const attempt = await this.attemptRepository.findAttemptDetails(attemptId);
    if (!attempt) throw new NotFoundException('attempt not found');

    const time = new Date(time_of_answer).getTime();
    const startedAt = new Date(attempt.startedAt).getTime();
    const expiresAt = new Date(attempt.expiresAt).getTime();

    if (time < startedAt || time > expiresAt)
      throw new ForbiddenException('exam time finished');
  }
}
