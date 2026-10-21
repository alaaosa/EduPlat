import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamRepository } from '../infrastructure/repo/exam.repo';
import { CreateExamDTO } from '../presentation/dto/exam.dto';
import { ExamTypes } from '../domain/enum/types-of-exam';
import { ExamEntity } from '../domain/entity/exam-management';
import { QuestionEntity } from '../domain/entity/question-management';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { Ownership } from '../domain/policy/ownership';

@Injectable()
export class ExamService {
  constructor(
    private readonly examRepository: ExamRepository,
    @InjectConnection() private readonly sequlize: Sequelize,
    private readonly ownership: Ownership,
  ) {}

  async create(
    dto: CreateExamDTO,
    itemId: number,
    type: ExamTypes,
    instructerId: number,
  ) {
    await this.ownership.verify(itemId, type, instructerId);
    const { questions, ...details } = dto;
    const examEntity = new ExamEntity(
      itemId,
      type,
      details.passingScore,
      details.duration,
    );
    examEntity.validateExamData({ ...details, itemId, type });
    const questionEntity = new QuestionEntity(questions);
    questionEntity.validate();

    return this.sequlize.transaction(async (transaction) => {
      const exam = await this.examRepository.create(
        {
          ...details,
          itemId,
          type,
        },
        transaction,
      );

      await this.examRepository.bulkCreateQuestions(questions, exam.id);
      return exam;
    });
  }

  async getExamDetails(itemId: number, type: ExamTypes, userId: number) {
    const examDetails = await this.examRepository.findExamDetails(
      itemId,
      type,
      userId,
    );
    if (!examDetails) throw new NotFoundException("can't get exam");

    if (examDetails.attempts.length > 0) {
      return {
        message: 'You have already attempted this quiz',
        score: examDetails.attempts[0].grade.score,
      };
    }
    return examDetails;
  }
}
