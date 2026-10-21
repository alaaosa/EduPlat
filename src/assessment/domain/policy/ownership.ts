import { Injectable } from '@nestjs/common';
import { ExamTypes } from '../enum/types-of-exam';
import { CourseRepository } from 'src/learning/course/infrastructure/persistence/sequelize/course.repo';
import { AssessmentDomainError } from '../err/domain.err';
import { LessonRepository } from 'src/lesson/repo/lesson.repo';

@Injectable()
export class Ownership {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly lessonRepository: LessonRepository,
  ) {}
  async verify(itemId: number, type: ExamTypes, instructorId: number) {
    if (type === ExamTypes.FINAL) {
      const course = await this.courseRepository.getInstructerId(itemId);

      if (!course || course.instructerId !== instructorId)
        throw new AssessmentDomainError('');

      return;
    }

    const lesson = await this.lessonRepository.getInstructerId(itemId);
    if (!lesson || lesson['instructerId'] !== instructorId)
      throw new AssessmentDomainError('');

    return;
  }
}
