import { ForbiddenException, Injectable } from '@nestjs/common';
import { ExamTypes } from 'src/assessment/domain/enum/types-of-exam';
import { EnrollmentRepository } from 'src/enrollment/repo/enrollment.repo';
import { LessonRepository } from 'src/lesson/repo/lesson.repo';
import { ExamRecord } from '../helpers';

@Injectable()
export class ExamMap {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly examRecord: ExamRecord,
  ) {}

  private async isEligibleForExam(courseId: number, userId: number) {
    const isEnrolled = await this.enrollmentRepo.findByCourseIdAndUserId(
      courseId,
      userId,
    );

    if (!isEnrolled)
      throw new ForbiddenException('You are not enrolled in this course');

    return isEnrolled;
  }

  async getDataForExam(type: ExamTypes, id: number, userId: number) {
    const courseId = await this.examRecord.findeCourseIdBasedExamType(type, id);

    const isEnrolled = await this.isEligibleForExam(courseId, userId);

    return isEnrolled;
  }
}
