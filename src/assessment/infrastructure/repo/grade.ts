import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Grade } from '../model/grade';
import { StudentAnswer } from '../model/student-answer';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class GradeRepository {
  constructor(
    private readonly handleException: HandleException,
    @InjectModel(Grade) private readonly gradeModel: typeof Grade,
    @InjectModel(StudentAnswer)
    private readonly studentAnswerModel: typeof StudentAnswer,
  ) {}

  saveStudentAnswer(
    data: Omit<
      CreationAttributes<StudentAnswer>,
      'userId' | 'examId' | 'attemptId'
    >,
    userId: number,
    examId: number,
    attemptId: number,
  ) {
    return this.handleException.handle(async () =>
      this.studentAnswerModel.upsert({ ...data, userId, examId, attemptId }),
    );
  }

  getStudentAnswersByExamIdAndUserId(examId: number, userId: number) {
    return this.handleException.handle(async () => {
      const answers = await this.studentAnswerModel.findAll({
        where: { examId, userId },
        attributes: ['questionId', 'studentAnswerId'],
      });
      return answers.map((answer) => ({
        id: answer.questionId,
        answerId: answer.studentAnswerId,
      }));
    });
  }

  saveGrade(
    data: Omit<CreationAttributes<Grade>, 'userId' | 'examId' | 'attemptId'>,
    userId: number,
    examId: number,
    attemptId: number,
  ) {
    return this.handleException.handle(async () =>
      this.gradeModel.create({ ...data, userId, examId, attemptId }),
    );
  }
}
