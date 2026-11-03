import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ExamTypes } from 'src/assessment/domain/shared/enum/types-of-exam';
import { LessonRepository } from 'src/lesson/repo/lesson.repo';

@Injectable()
export class ExamRecord {
  constructor(private readonly lessonRepo: LessonRepository) {}

  async findeCourseIdBasedExamType(type: ExamTypes, id: number) {
    const allowedRecord: Record<
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

    const handler = allowedRecord[type];

    if (!handler) throw new BadRequestException();

    return handler(id);
  }
}
