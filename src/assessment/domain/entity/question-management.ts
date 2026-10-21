import { QuestionTypes } from '../enum/types-of-questions';
import { AssessmentDomainError } from '../err/domain.err';
import { QuestionTemp } from '../template/question.temp';

export class QuestionEntity {
  constructor(private readonly questions: QuestionTemp) {}

  validate(): void {
    this.questions.forEach((q, index) => {
      const questionNumber = index + 1;

      if (!Object.values(QuestionTypes).includes(q.questionType)) {
        throw new AssessmentDomainError(
          `Unsupported question type at question ${questionNumber}`,
        );
      }

      if (!q.question) throw new AssessmentDomainError('enter question');

      if (!q.question.trim() || q.question.trim().length < 10) {
        throw new AssessmentDomainError(
          `Question ${questionNumber} must contain at least 10 characters`,
        );
      }

      const expectedAnswers = q.questionType === QuestionTypes.MCQ ? 4 : 2;

      if (
        q.answers.length !== expectedAnswers ||
        q.answers.filter((a) => a.isCorrect).length !== 1
      ) {
        throw new AssessmentDomainError(
          `Question ${questionNumber} must have ${expectedAnswers} answers and exactly one correct answer`,
        );
      }
    });
  }

  checkQuestionsContainsToExam(
    studentAnswers: { questionId: number; answerId: number }[],
  ) {
   
  }
}
