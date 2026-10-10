import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FinalRepo } from './repo/final.repo';
import { Sequelize, Transaction } from 'sequelize';
import { InjectConnection } from '@nestjs/sequelize';
import { McqService } from '../strategies/mcq.service';
import { CreateFinalDto } from './dto/create-final.dto';
import { examType } from '../models/MCQ&TF/question';
import { CourseRepository } from 'src/course/repo/course.repo';

@Injectable()
export class FinalService {
  constructor(
    private readonly finalRepo: FinalRepo,
    @InjectConnection() private sequlize: Sequelize,
    private readonly mcq_tf_Service: McqService,
    private readonly courseRepository: CourseRepository,
  ) {}

  /**
   * @param createFinalDto
   * @param courseId
   *
   *  @returns  create final exam with its questions & answers for a specific course
   */

  async create(dto: CreateFinalDto, courseId: number, instructerId: number) {
    
    const course =
      await this.courseRepository.findInstructerIdFromCourse(courseId);
    if (!course || course.instructerId !== instructerId)
      throw new UnauthorizedException('not allowed');

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
