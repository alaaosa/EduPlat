import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { examType, Mcq_TF_Question } from '../models/MCQ&TF/question';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes, Transaction } from 'sequelize';
import { Mcq_TF_Answer } from '../models/MCQ&TF/answer';
import { Grade } from '../models/MCQ&TF/grade';

type creationQuestion = Omit<
  CreationAttributes<Mcq_TF_Question>,
  'examId' | 'examType'
>;
type creationAnswer = Omit<CreationAttributes<Mcq_TF_Answer>, ''>;
type creationGrade = Omit<CreationAttributes<Grade>, 'userId' | 'examId'>;
@Injectable()
export class McqRepository {
  constructor(
    private readonly handleException: HandleException,
    @InjectModel(Mcq_TF_Question)
    private readonly questionModel: typeof Mcq_TF_Question,
    @InjectModel(Mcq_TF_Answer)
    private readonly answerModel: typeof Mcq_TF_Answer,
    @InjectModel(Grade)
    private readonly gradeModel: typeof Grade,
  ) {}

  createQuestion(
    questionData: creationQuestion[],
    examId: number,
    examType: examType,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(() =>
      this.questionModel.bulkCreate(
        questionData.map((data) => ({
          ...data,
          examId,
          examType,
        })),
        { transaction },
      ),
    );
  }

  createAnswer(answerData: creationAnswer[], transaction?: Transaction) {
    return this.handleException.handle(() =>
      this.answerModel.bulkCreate(
        answerData.map((data) => ({
          ...data,
        })),
        { transaction },
      ),
    );
  }

  createGrade(
    gradeData: creationGrade[],
    examId: number,
    userId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(() =>
      this.gradeModel.bulkCreate(
        gradeData.map((data) => ({
          ...data,
          examId,
          userId,
        })),
        { transaction },
      ),
    );
  }

  /**
   *
   * @param examId
   * @param page => Optional
   * @param limit => Optional
   * @returns questions from type mcq , tf that related to this examId
   */
  findAllQuestionsByExamId(examId: number, type: examType) {
    return this.handleException.handle(() =>
      this.questionModel.findAll({
        where: { examId, examType: type },
        attributes: ['id', 'question'],
        order: [['id', 'ASC']],
        include: [
          {
            model: Mcq_TF_Answer,
            as: 'answers',
            attributes: ['id', 'answer'],
          },
        ],
      }),
    );
  }

  findAnswerForExam(
    examId: number,
    type: examType,
    questionId: number,
    answerId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(() =>
      this.answerModel.findOne({
        where: { id: answerId, questionId },
        attributes: ['id'],
        include: [
          {
            model: Mcq_TF_Question,
            required: true,
            attributes: [],
            where: { id: questionId, examId, examType: type },
          },
        ],
        transaction,
      }),
    );
  }
}
