import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttemptRepository } from '../infrastructure/repo/attempt';
import { ExamRepository } from '../infrastructure/repo/exam.repo';
import { AttemptStatus } from '../domain/shared/enum/attempt';
import { InjectQueue } from '@nestjs/bullmq';
import { queueNames } from 'src/common/queue';
import { Queue } from 'bullmq';
import { ExamTypes } from '../domain/shared/enum/types-of-exam';
import { ExamMap } from './mappers/exam-map';
import { RedisService } from 'src/redis/redis.service';
import { GradeService } from './grade.service';
import EventEmitter2 from 'eventemitter2';
import { randomUUID } from 'crypto';

@Injectable()
export class AttemptService {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly examRepository: ExamRepository,
    @InjectQueue(queueNames.EXAM) private readonly examQueue: Queue,
    private readonly examMap: ExamMap,
    private readonly redisService: RedisService,
    private readonly eventEmmitter: EventEmitter2,
  ) {}

  // DELETE LESSON GUARD FROM CONTRLLER
  async start(examId: number, userId: number, type: ExamTypes) {
    const [exam, isEligiable] = await Promise.all([
      this.examRepository.findByExamId(examId),
      this.examMap.getDataForExam(type, examId, userId),
    ]).catch((err) => {
      throw new BadRequestException(err);
    });

    if (!exam) throw new NotFoundException('exam not found');

    const startedAt = new Date();

    const data = {
      startedAt,
      expiresAt: new Date(startedAt.getTime() + 60_000 * exam.duration),
      status: AttemptStatus.IN_PROGRESS,
    };

    const attempt = await this.attemptRepository.create(data, userId, examId);

    await this.redisService.client
      .set(
        `exam-${userId}-${attempt.id}`,
        JSON.stringify({ examId, userId, attemptId: attempt.id, isEligiable }),
        'EX',
        60 * exam.duration,
      )
      .catch((err) => {
        throw new BadRequestException(err);
      });

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

  async submit(attemptId: number, userId: number, studentName: string) {
    const attempt =
      await this.attemptRepository.findAttemptDetailsToSubmit(attemptId);
    if (!attempt) throw new NotFoundException('attempt not found');

    if (attempt.status !== AttemptStatus.IN_PROGRESS)
      throw new ForbiddenException('attempt not in progress');

    await this.attemptRepository.updateAttemptStatus(
      attemptId,
      AttemptStatus.SUBMITTED,
    );

    await this.redisService.client
      .del(`exam-${userId}-${attemptId}`)
      .catch((err) => {
        throw new BadRequestException(err);
      });

    this.eventEmmitter.emit(`exam.submitted`, {
      idempotency_key: randomUUID(),
      examId: attempt.examId,
      userId,
      attemptId,
      studentName,
      type: attempt.exam.type,
    });
  }
}
