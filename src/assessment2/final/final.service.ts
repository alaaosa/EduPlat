import { Injectable, NotFoundException } from '@nestjs/common';
import { FinalRepo } from './repo/final.repo';
import { Sequelize, Transaction } from 'sequelize';
import { InjectConnection } from '@nestjs/sequelize';
import { McqService } from '../strategies/mcq.service';
import { CreateFinalDto } from './dto/create-final.dto';
import { examType } from '../models/MCQ&TF/question';
import { choiceDto } from '../dto/mcq&tf';
import { AttemptRepository } from '../repo/attempt.repo';
import { AttemptStatus } from '../models/attempt';

@Injectable()
export class FinalService {
  constructor(
    private readonly finalRepo: FinalRepo,
    @InjectConnection() private sequlize: Sequelize,
    private readonly mcq_tf_Service: McqService,
    private readonly attemptRepository: AttemptRepository,
  ) {}

  /**
   * @param createFinalDto
   * @param courseId
   *
   *  @returns  create final exam with its questions & answers for a specific course
   */

  create(dto: CreateFinalDto, courseId: number) {
    const { mcq_tf_questions, ...details } = dto;
    return this.sequlize.transaction(async (transaction) => {
      const final = await this.finalRepo.create(details, courseId, transaction);
      await this.mcq_tf_Service.createQuestions(
        mcq_tf_questions,
        final.id,
        examType.FINAL,
        transaction,
      );

      return final;
    });
  }
 
}
