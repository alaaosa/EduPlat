import { ExamTypes } from '../enum/types-of-exam';
import { AssessmentDomainError } from '../err/domain.err';

export class ExamEntity {
  constructor(
    public readonly itemId: number, // lessonId , CourseId
    public readonly type: ExamTypes,
    public readonly passingScore: number,
    public readonly duration: number,
  ) {}

  validateExamData(data: {
    itemId: number;
    type: ExamTypes;
    passingScore: number;
    duration: number;
  }) {
    if (
      data.duration <= 0 ||
      data.passingScore <= 0 ||
      data.passingScore > 100 ||
      !Number.isInteger(data.itemId) ||
      data.itemId <= 0
    )
      throw new AssessmentDomainError('assessment error');
  }
}
