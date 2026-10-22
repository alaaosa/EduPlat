import { Injectable, NotFoundException } from '@nestjs/common';
import { EnrollDto } from './dto/enrollment.dto';
import { EnrollmentRepository } from './repo/enrollment.repo';
import { EnrollmentTypes } from '../learning/course/domain/enums/enrollment.enum';
import { OnEvent } from '@nestjs/event-emitter';


@Injectable()
export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  @OnEvent('payment.course.successfully')
  async enroll(dto: EnrollDto) {
    await this.enrollmentRepository.create(
      dto.itemId,
      dto.userId,
      EnrollmentTypes.COMPELETE,
    );
  }
}
