import { AssessmentDomainError } from '../err/domain.err';
import { ExamQuestions, StudentAnswers } from '../template/question.temp';

export class GradeEntity {
  private readonly studentMap: Map<number, number>;
  private readonly examMap: Map<number, number>;

  constructor(
    private readonly examQuestions: ExamQuestions,
    private readonly studentAnswers: StudentAnswers,
  ) {
    this.studentMap = new Map(
      this.studentAnswers.map((a) => [a.id, a.answer.id]),
    );

    this.examMap = new Map(this.examQuestions.map((q) => [q.id, q.answer.id]));
  }

  validateQuestions() {
    const allQuestionsBelongToExam = [...this.studentMap.keys()].every(
      (questionId) => this.examMap.has(questionId),
    );

    if (!allQuestionsBelongToExam) {
      throw new AssessmentDomainError(
        'Some questions do not belong to this exam',
      );
    }
  }

  grade() {
    this.validateQuestions();

    let studentGrade = 0;

    for (const [questionId, answerId] of this.studentMap) {
      const correctAnswerId = this.examMap.get(questionId);

      if (answerId === correctAnswerId) {
        studentGrade++;
      }
    }

    return studentGrade;
  }
}
