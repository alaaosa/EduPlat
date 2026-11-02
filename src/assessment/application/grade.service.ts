import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GradeRepository } from '../infrastructure/repo/grade';
import { StudentAnswerDTO } from '../presentation/dto/student-answer';
import { ExamMap } from './mappers/exam-map';
import { RedisService } from 'src/redis/redis.service';
import { ExamRepository } from '../infrastructure/repo/exam.repo';
import { GradeEntity } from '../domain/entity/grade';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ExamTypes } from '../domain/enum/types-of-exam';
import { randomUUID } from 'crypto';

@Injectable()
export class GradeService {
  constructor(
    private readonly gradeRepo: GradeRepository,
    private readonly examRepo: ExamRepository,
    private readonly examMap: ExamMap,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async saveStudentAnswer(
    dto: StudentAnswerDTO,
    userId: number,
    examId: number,
    attemptId: number,
  ) {
    const results = await this.redisService.client
      .get(`exam-${userId}-${attemptId}`)
      .catch((err) => {
        throw new BadRequestException('Error saving answer');
      });

    if (!results) {
      await this.examMap.getDataForExam(dto.examType, examId, userId);
    } else {
      const data = JSON.parse(results) as {
        examId: number;
        userId: number;
        attemptId: number;
        isEligiable: boolean;
      };

      if (
        data.examId !== examId ||
        data.userId !== userId ||
        data.attemptId !== attemptId ||
        !data.isEligiable
      ) {
        throw new ForbiddenException(
          'You are not allowed to submit answers for this exam',
        );
      }
    }

    await this.gradeRepo.saveStudentAnswer(
      { questionId: dto.questionId, studentAnswerId: dto.answerId },
      userId,
      examId,
      attemptId,
    );
  }

  @OnEvent('exam.submitted')
  async gradeExam(payload: {
    idempotency_key: string;
    examId: number;
    userId: number;
    attemptId: number;
    studentName: string;
    type: string;
  }) {
    const result = await this.redisService.client.set(
      `${payload.idempotency_key}`,
      JSON.stringify({ examId: payload.examId, userId: payload.userId }),
      'EX',
      60 * 60,
      'NX',
    );

    if (!result) return;

    const { examId, userId } = payload;
    const [exam, answers] = await Promise.all([
      this.examRepo.findByExamIdToGrade(examId),
      this.gradeRepo.getStudentAnswersByExamIdAndUserId(examId, userId),
    ]).catch((err) => {
      throw new BadRequestException('Error grading exam');
    });

    if (!exam || !answers || answers.length == 0)
      throw new BadRequestException('Exam not found');

    const GradeDomain = new GradeEntity(exam.answers, answers);
    const studentGrade = GradeDomain.grade();

    await this.gradeRepo.saveGrade(
      { score: studentGrade },
      userId,
      examId,
      payload.attemptId,
    );

    const isPassed = studentGrade >= exam.passingScore;
    const event = `exam.${payload.type}.graded`;
    if (payload.type === ExamTypes.FINAL) {
      this.eventEmitter.emit(event, {
        idempotency_key: randomUUID(),
        studentName: payload.studentName,
        examId,
        type: payload.type,
        isPassed,
        score: studentGrade,
      });
    } else {
      /// HERE => LOGIC OF GRADED QUIZ
    }
    return {
      score: studentGrade,
      isPassed,
    };
  }
}
