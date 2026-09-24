import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Attempt, AttemptStatus } from '../models/attempt';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes, Op, Transaction } from 'sequelize';
import { StudentAnswer } from '../models/MCQ&TF/student.answer';
import { examType } from '../models/MCQ&TF/question';

type createAttempt = Omit<CreationAttributes<Attempt>, 'userId'>;

@Injectable()
export class AttemptRepository {
  constructor(
    private readonly handlerException: HandleException,
    @InjectModel(Attempt) private readonly attemptModel: typeof Attempt,
    @InjectModel(StudentAnswer)
    private readonly studentAnswerModel: typeof StudentAnswer,
  ) {}

  /**
   *
   * @param attempt
   * @param userId
   * @returns add record to Attempt table in db
   */
  createAttempt(attempt: createAttempt, userId: number) {
    return this.handlerException.handle(() =>
      this.attemptModel.create({ ...attempt, userId }),
    );
  }

  /**
   *
   * @param userId
   * @param assessmentId
   * @returns attempt that have an attempt from assessment , userId
   */

  findByUserIdAndAssessmentId(
    userId: number,
    assessmentId: number,
    type: examType,
  ) {
    return this.handlerException.handle(() =>
      this.attemptModel.findOne({
        where: { userId, assessmentId, examType: type },
      }),
    );
  }
  findByUserIdAndAttemptId(attemptId: number, userId: number) {
    return this.handlerException.handle(() =>
      this.attemptModel.findOne({ where: { id: attemptId, userId } }),
    );
  }

  findByAttemptId(attemptId: number) {
    return this.handlerException.handle(async () => {
      return this.attemptModel.findByPk(attemptId);
    });
  }

  /**
   *
   * @param assessmentId
   * @param userId
   * @returns grade of student
   */

  getGrade(assessmentId: number, userId: number) {
    return this.handlerException.handle(async () => {
      return this.attemptModel.findOne({
        where: { assessmentId, userId },
        attributes: ['studentScore'],
      });
    });
  }

  findStudentAnswer(
    attemptId: number,
    questionId: number,
    transaction?: Transaction,
  ) {
    return this.handlerException.handle(() =>
      this.studentAnswerModel.findOne({
        where: { attemptId, questionId },
        transaction,
        lock: transaction?.LOCK.UPDATE,
      }),
    );
  }

  findByUserIdAndAttemptIdForUpdate(
    attemptId: number,
    userId: number,
    transaction: Transaction,
  ) {
    return this.handlerException.handle(() =>
      this.attemptModel.findOne({
        where: { id: attemptId, userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      }),
    );
  }

  saveStudentAnswer(
    questionId: number,
    answerId: number,
    attemptId: number,
    revision: number,
    transaction?: Transaction,
  ) {
    return this.handlerException.handle(async () =>
      this.studentAnswerModel.upsert(
        { questionId, answerId, attemptId, revision },
        { transaction },
      ),
    );
  }

  getAllStudentAnswers(attemptId: number, transaction?: Transaction) {
    return this.handlerException.handle(async () =>
      this.studentAnswerModel.findAll({
        where: { attemptId },
        attributes: ['questionId', 'answerId'],
        transaction,
        lock: transaction?.LOCK.UPDATE,
      }),
    );
  }

  findExpiredInProgress(now: Date) {
    return this.handlerException.handle(() =>
      this.attemptModel.findAll({
        where: {
          status: AttemptStatus.IN_PROGRESS,
          expiresAt: { [Op.lte]: now },
        },
        attributes: ['id', 'assessmentId', 'userId', 'examType'],
      }),
    );
  }
}
