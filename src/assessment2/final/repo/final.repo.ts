import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Final } from '../entities/final.entity';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes, Model, Transaction, where } from 'sequelize';
import { Mcq_TF_Question } from 'src/assessment2/models/MCQ&TF/question';
import { Course } from 'src/course/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
import { Mcq_TF_Answer } from 'src/assessment2/models/MCQ&TF/answer';

type creationFinal = Omit<CreationAttributes<Final>, 'courseId'>;

@Injectable()
export class FinalRepo {
  constructor(
    private readonly handlerException: HandleException,
    @InjectModel(Final) private readonly finalModel: typeof Final,
    // @InjectModel(FinalGrade) private readonly gradeModel: typeof FinalGrade,
  ) {}

  create(
    finalData: creationFinal,
    courseId: number,
    transaction?: Transaction,
  ) {
    return this.handlerException.handle(async () => {
      return this.finalModel.create(
        { ...finalData, courseId },
        { transaction },
      );
    });
  }

  // createFinalGrade(data: creationFinalGrade, userId: number, finalId: number , transaction?:Transaction) {
  //   return this.handlerException.handle(async () => {
  //     return FinalGrade.create({ ...data, userId, finalId } , {transaction});
  //   });
  // }

  /**
   *
   * @param finalId
   * @description get final exam and all that related with it
   *
   */

  findFinalById(finalId: number, transaction?: Transaction) {
    return this.handlerException.handle(async () => {
      return this.finalModel.findByPk(finalId, {
        attributes: ['id', 'passingScore', 'duration'],
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
          {
            model: Course,
            as: 'course',
            attributes: ['title', 'numOfHours'],
            include: [
              {
                model: User,
                as: 'instructer',
                attributes: ['name'],
              },
            ],
          },
        ],
        transaction,
      });
    });
  }

  findFinalByCourseId(courseId: number, transaction?: Transaction) {
    return this.handlerException.handle(async () => {
      return this.finalModel.findOne({
        where: { courseId },
        attributes: ['id', 'passingScore', 'duration'],
        transaction,
      });
    });
  }

}
