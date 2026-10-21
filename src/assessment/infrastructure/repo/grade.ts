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
    data: Omit<CreationAttributes<StudentAnswer>, 'userId'>,
    userId: number,
  ) {
    return this.handleException.handle(async () =>
      this.studentAnswerModel.upsert({ ...data, userId }),
    );
  }
}
