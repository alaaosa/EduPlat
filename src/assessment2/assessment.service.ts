import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { choiceDto } from './dto/mcq&tf';
import { ExamTypeService } from 'src/common/services/examtype.service';
import { examType, Mcq_TF_Question } from './models/MCQ&TF/question';
import { McqRepository } from './repo/mcq.repo';
import { AttemptRepository } from './repo/attempt.repo';
import { Sequelize, UniqueConstraintError } from 'sequelize';
import { InjectConnection } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bullmq';
import { queueNames } from 'src/common/queue';
import { Queue } from 'bullmq';
import { McqService } from './strategies/mcq.service';
import EventEmitter2 from 'eventemitter2';
import { AssessmentEventNames } from './shared/const/event.names';
import { AttemptStatus } from './shared/enum/attempt';
import { CourseProgressService } from 'src/course/progress/course-progress.service';

type AssessmentUser = { id: number; name: string };

export type AssessmentResult = {
  attemptId: number;
  status: AttemptStatus;
  score: number | null;
  finalized: boolean;
};

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    private readonly examTypeService: ExamTypeService,
    private readonly mcqRepository: McqRepository,
    private readonly eventEmitter2: EventEmitter2,
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectQueue(queueNames.ASSESSMENT) private readonly assessmentQueue: Queue,
    private readonly mcqService: McqService,
    private readonly attemptRepo: AttemptRepository,
    private readonly courseProgressService: CourseProgressService,
  ) {}

  async startAssessment(
    type: examType,
    assessmentId: number,
    user: AssessmentUser,
  ): Promise<{
    attemptId: number;
    duration: number;
    questions: Mcq_TF_Question[];
  }> {
    let exam: any;
    let questions: Mcq_TF_Question[];
    let duration: number;
    try {
      if (type === examType.FINAL) {
        exam = await this.examTypeService.getAssessmentConfig(
          type,
          assessmentId,
        );

        if (!exam) throw new NotFoundException('Assessment not found');
        duration = Number(exam.duration);
        if (!Number.isFinite(duration) || duration <= 0)
          throw new ConflictException('Assessment duration is not configured');

        // if user doesn't ccomplete , this will send exception
        await this.courseProgressService.assertFinalEligible(
          exam.courseId,
          user.id,
        );

        questions = await this.mcqRepository.findAllQuestionsByExamId(
          assessmentId,
          type,
        );
      } else {
        [exam, questions] = await Promise.all([
          this.examTypeService.getAssessmentConfig(type, assessmentId),
          this.mcqRepository.findAllQuestionsByExamId(assessmentId, type),
        ]);
        duration = Number(exam?.duration);
        if (!Number.isFinite(duration) || duration <= 0)
          throw new ConflictException('Assessment duration is not configured');
      }
      
      if (!exam) throw new NotFoundException('Assessment not found');

      if (questions.length === 0) {
        throw new NotFoundException('No questions found for this assessment');
      }

      let attempt = await this.attemptRepo.findByUserIdAndAssessmentId(
        user.id,
        assessmentId,
        type,
      );

      if (!attempt) {
        const startedAt = new Date();
        const expiresAt = new Date(startedAt.getTime() + duration * 60_000);

        attempt = await this.attemptRepo
          .createAttempt(
            {
              assessmentId,
              examType: type,
              status: AttemptStatus.IN_PROGRESS,
              startedAt,
              expiresAt,
            },
            user.id,
          )
          .catch(async (error) => {
            if (!(error instanceof UniqueConstraintError)) throw error;
            attempt = await this.attemptRepo.findByUserIdAndAssessmentId(
              user.id,
              assessmentId,
              type,
            );
            if (!attempt) throw error;
            return attempt;
          });
      }

      if (
        attempt.status === AttemptStatus.IN_PROGRESS &&
        attempt.expiresAt <= new Date()
      ) {
        await this.expireAttempt(attempt.id, assessmentId, user, type);
        throw new ConflictException('Your attempt has expired');
      }
      if (attempt.status === AttemptStatus.COMPLETED) 
        throw new ConflictException('Your attempt is already completed');
      
      if (attempt.status === AttemptStatus.FINALIZING) 
        throw new ConflictException('Your attempt is being finalized');
      

      await this.scheduleExpiration(
        attempt.id,
        assessmentId,
        user,
        type,
        attempt.expiresAt,
      );

      return { attemptId: attempt.id, duration, questions };
    } catch (err) {
      this.logger.error("can't start thr exam");
      throw new BadRequestException((err as Error).message);
    }
  }

  async saveAnswer(
    attemptId: number,
    userId: number,
    answer: choiceDto,
  ): Promise<{ revision: number }> {
    return this.sequelize.transaction(async (transaction) => {
      const attempt = await this.attemptRepo.findByUserIdAndAttemptIdForUpdate(
        attemptId,
        userId,
        transaction,
      );
      if (!attempt) throw new ForbiddenException('Attempt not found');
      if (attempt.status !== AttemptStatus.IN_PROGRESS)
        throw new ConflictException('Attempt is no longer answerable');

      if (attempt.expiresAt <= new Date())
        throw new ConflictException('Attempt has expired');

      const validAnswer = await this.mcqRepository.findAnswerForExam(
        attempt.assessmentId,
        attempt.examType,
        answer.questionId,
        answer.answerId,
        transaction,
      );
      if (!validAnswer)
        throw new ForbiddenException('Invalid question or answer');

      const existing = await this.attemptRepo.findStudentAnswer(
        attemptId,
        answer.questionId,
        transaction,
      );
      if (existing && answer.revision <= existing.revision)
        throw new ConflictException('Stale answer revision');

      if (!existing && answer.revision !== 0) {
        throw new ConflictException('Answer revision must start at zero');
      }

      await this.attemptRepo.saveStudentAnswer(
        answer.questionId,
        answer.answerId,
        attemptId,
        answer.revision,
        transaction,
      );
      return { revision: answer.revision };
    });
  }

  async submitAssessment(
    assessmentId: number,
    attemptId: number,
    user: AssessmentUser,
    type: examType,
  ): Promise<AssessmentResult> {
    const outcome = await this.sequelize.transaction(async (transaction) => {
      const attempt = await this.attemptRepo.findByUserIdAndAttemptIdForUpdate(
        attemptId,
        user.id,
        transaction,
      );
      if (
        !attempt ||
        attempt.assessmentId !== assessmentId ||
        attempt.examType !== type
      ) {
        throw new ForbiddenException('Attempt not found');
      }
      if (attempt.status === AttemptStatus.COMPLETED) {
        return { result: this.toResult(attempt, false), gradeEvent: undefined };
      }
      if (attempt.status === AttemptStatus.FINALIZING) {
        throw new ConflictException('Attempt is being finalized');
      }
      if (attempt.expiresAt <= new Date()) {
        this.logger.warn(
          `Attempt ${attempt.id} submitted after expiry; finalizing as expired instead of accepting a normal submission.`,
        );
      }

      await attempt.update(
        { status: AttemptStatus.FINALIZING },
        { transaction },
      );
      const exam = await this.examTypeService.getQuestionsRecord(
        type,
        assessmentId,
      );
      if (!exam) throw new NotFoundException('Assessment not found');

      const answerKey = exam.questions.map((question) => {
        const correctAnswer = question.answers[0];
        if (!correctAnswer) {
          throw new NotFoundException(
            'Assessment contains a question without a correct answer',
          );
        }
        return { questionId: question.id, answerId: correctAnswer.id };
      });
      const answers = await this.attemptRepo.getAllStudentAnswers(
        attemptId,
        transaction,
      );
      const grade = this.mcqService.grade(answers, answerKey);

      await attempt.update(
        { status: AttemptStatus.COMPLETED, studentScore: grade.score },
        { transaction },
      );
      return {
        result: {
          attemptId,
          status: AttemptStatus.COMPLETED,
          score: grade.score,
          finalized: true,
        },
        gradeEvent: { exam, score: grade.score },
      };
    });

    if (outcome.gradeEvent) {
      this.emitGradedEvent(
        outcome.gradeEvent.exam,
        outcome.gradeEvent.score,
        attemptId,
        user,
        type,
        assessmentId,
      );
    }
    return outcome.result;
  }

  async getResult(assessmentId: number, type: examType, userId: number) {
    const attempt = await this.attemptRepo.findByUserIdAndAssessmentId(
      userId,
      assessmentId,
      type,
    );
    if (!attempt) throw new NotFoundException('Attempt not found');

    if (!Object.values(examType).includes(type)) {
      throw new ForbiddenException('Invalid assessment type');
    }
    return this.toResult(attempt, false);
  }

  async expireAttempt(
    attemptId: number,
    assessmentId: number,
    user: AssessmentUser,
    type: examType,
  ) {
    const attempt = await this.attemptRepo.findByUserIdAndAttemptId(
      attemptId,
      user.id,
    );
    if (
      !attempt ||
      attempt.status !== AttemptStatus.IN_PROGRESS ||
      attempt.expiresAt > new Date()
    ) {
      return;
    }
    await this.submitAssessment(assessmentId, attemptId, user, type);
  }

  private async scheduleExpiration(
    attemptId: number,
    assessmentId: number,
    user: AssessmentUser,
    type: examType,
    expiresAt: Date,
  ) {
    try {
      await this.assessmentQueue.add(
        'expired_time',
        { assessmentId, attemptId, user, type },
        {
          delay: Math.max(0, expiresAt.getTime() - Date.now()),
          jobId: `expired:${attemptId}`,
        },
      );
    } catch (error) {
      this.logger.warn(
        `Could not schedule expiration for attempt ${attemptId}: ${String(error)}`,
      );
    }
  }

  private toResult(
    attempt: { id: number; status: AttemptStatus; studentScore: number | null },
    finalized: boolean,
  ): AssessmentResult {
    return {
      attemptId: attempt.id,
      status: attempt.status,
      score: attempt.studentScore,
      finalized,
    };
  }

  private emitGradedEvent(
    exam: any,
    score: number,
    attemptId: number,
    user: AssessmentUser,
    type: examType,
    assessmentId: number,
  ) {
    try {
      if (type === examType.FINAL) {
        this.eventEmitter2.emit(AssessmentEventNames.FINISH_FINAL, {
          success: score >= Number(exam.passingScore),
          courseName: exam.course?.title,
          instructorName: exam.course?.instructer?.name,
          numOfHours: exam.course?.numOfHours,
          studentName: user.name,
          id: user.id,
        });
        return;
      }
      this.eventEmitter2.emit('attempt.graded', {
        attemptId,
        userId: user.id,
        score,
        type,
        assessmentId,
      });
    } catch (error) {
      this.logger.error(
        `Could not emit grading event for attempt ${attemptId}`,
        error as Error,
      );
    }
  }
}
