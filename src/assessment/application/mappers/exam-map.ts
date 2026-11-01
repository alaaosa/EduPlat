import { ForbiddenException, Injectable } from '@nestjs/common';
import { ExamTypes } from 'src/assessment/domain/enum/types-of-exam';
import { EnrollmentRepository } from 'src/enrollment/repo/enrollment.repo';
import { LessonRepository } from 'src/lesson/repo/lesson.repo';

@Injectable()
export class ExamMap {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly lessonRepo: LessonRepository,
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

  private allowedRecord: Record<
    ExamTypes,
    (id: number) => Promise<number> | number
  > = {
    [ExamTypes.FINAL]: (courseId: number) => courseId,
    [ExamTypes.QUIZ]: async (lessonId: number) => {
      const lesson = await this.lessonRepo.getCourseIdByLessonId(lessonId);
      if (!lesson) throw new ForbiddenException('Lesson not found');
      return lesson.section.course.id;
    },
  };

  async getDataForExam(type: ExamTypes, id: number, userId: number) {
    const handler = this.allowedRecord[type];
    if (!handler) throw new ForbiddenException('Invalid exam type');

    const courseId = await handler(id);

    const isEnrolled = await this.isEligibleForExam(courseId, userId);

    return isEnrolled;
  }
}
