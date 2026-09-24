import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, Sequelize, Transaction } from 'sequelize';
import { HandleException } from 'src/db/db.service';
import { Quiz } from '../entities/quiz.entity';
import {
  examType,
  Mcq_TF_Question,
} from 'src/assessment2/models/MCQ&TF/question';
import { Mcq_TF_Answer } from 'src/assessment2/models/MCQ&TF/answer';
import { Attempt } from 'src/assessment2/models/attempt';

@Injectable()
export class QuizRepo {
  constructor(
    private readonly handlerException: HandleException,
    @InjectModel(Quiz)
    private readonly quizModel: typeof Quiz,
  ) {}

  create(
    quiz: Pick<CreationAttributes<Quiz>, 'lessonId' | 'duration'>,
    transaction?: Transaction,
  ) {
    // Preserve the database unique-constraint error so QuizService can map the
    // concurrent create race to the public conflict response.
    return this.quizModel.create(quiz, { transaction });
  }

  // Assessment needs the correct answer key while Quiz remains scoped to its
  // own exam type; a numeric final ID must never join a quiz's questions.
  findQuizById(quizId: number, transaction?: Transaction) {
    return this.handlerException.handle(async () => {
      return this.quizModel.findByPk(quizId, {
        attributes: ['id', 'lessonId', 'duration'],
        include: [
          {
            model: Mcq_TF_Question,
            as: 'questions',
            attributes: ['id'],
            include: [
              {
                model: Mcq_TF_Answer,
                as: 'answers',
                attributes: ['id'],
                where: { isCorrect: true },
                required: true,
              },
            ],
          },
        ],
        transaction,
      });
    });
  }

  /**
   * Quiz administration/read endpoints do not need an answer key. Keep this
   * separate from findQuizById, whose shape is the Assessment contract.
   */
  findConfigurationById(quizId: number) {
    return this.handlerException.handle(() =>
      this.quizModel.findByPk(quizId, {
        attributes: ['id', 'lessonId', 'duration'],
      }),
    );
  }

  findConfigurationByLessonId(lessonId: number, userId: number) {
    return this.handlerException.handle(() =>
      this.quizModel.findOne({
        where: { lessonId },

        attributes: ['id', 'lessonId', 'duration'],
        include: [
          {
            model: Attempt,
            as: 'attempts',
            where: {
              userId,
              examType: examType.QUIZ,
              assessmentId: Sequelize.col('Quiz.id'),
            },
            attributes: ['id', 'score'],
            required: false,
          },
        ],
      }),
    );
  }

}
