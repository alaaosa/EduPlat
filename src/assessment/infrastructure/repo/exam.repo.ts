import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Exam } from '../model/exam';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes, Sequelize, Transaction } from 'sequelize';
import { Mcq_TF_Question } from '../model/question';
import { Mcq_TF_Answer } from '../model/answer';
import { model } from 'mongoose';
import { ExamTypes } from 'src/assessment/domain/enum/types-of-exam';
import { Attempt } from '../model/attempt';
import { Grade } from '../model/grade';

@Injectable()
export class ExamRepository {
  constructor(
    private readonly handleException: HandleException,
    @InjectModel(Exam) private readonly examModel: typeof Exam,
    @InjectModel(Mcq_TF_Question)
    private readonly mcq_TF_Question_Model: typeof Mcq_TF_Question,
    @InjectModel(Mcq_TF_Answer)
    private readonly mcq_TF_Answer_Model: typeof Mcq_TF_Answer,
  ) {}

  create(data: Omit<CreationAttributes<Exam>, ''>, transaction?: Transaction) {
    return this.handleException.handle(async () =>
      this.examModel.create(data, { transaction }),
    );
  }

  bulkCreateQuestions(
    data: Omit<CreationAttributes<Mcq_TF_Question>, 'examId'>[],
    examId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      const questions = await this.mcq_TF_Question_Model.bulkCreate(
        data.map((question) => {
          return {
            ...question,
            examId,
          };
        }),
        { transaction },
      );

      const answers = questions.flatMap((question, index) =>
        questions[index].answers.map((answer) => ({
          ...answer,
          questionId: question.id,
        })),
      );

      await this.mcq_TF_Answer_Model.bulkCreate(answers, { transaction });
    });
  }

  findByExamId(examId: number) {
    return this.handleException.handle(async () =>
      this.examModel.findByPk(examId, {
        include: [
          {
            model: Mcq_TF_Question,
            as: 'questions',
            required: true,
            include: [
              {
                model: Mcq_TF_Answer,
                attributes: {
                  exclude: ['isCorrect'],
                },
                required: true,
              },
            ],
          },
        ],
      }),
    );
  }

  findExamDetails(itemId: number, type: ExamTypes, userId: number) {
    return this.handleException.handle(async () =>
      this.examModel.findOne({
        where: {
          itemId,
          type,
        },
        attributes: [
          'id',
          'passingScore',
          'duration',
          [
            Sequelize.literal(`(
            SELECT COUNT(*)
            FROM mcq_tf_questions AS q
            WHERE q.examId = :examId
          )`),
            'questionsCount',
          ],
        ],
        include: [
          {
            model: Attempt,
            as: 'attempts',
            where: { userId },
            attributes: ['status', 'createdAt'],
            required: false,
            separate: true,
            limit: 1,
            order: [['createdAt', 'DESC']],
            include: [
              {
                model: Grade,
                required: false,
                as: 'grade',
                attributes: ['score'],
              },
            ],
          },
        ],
      }),
    );
  }
}
