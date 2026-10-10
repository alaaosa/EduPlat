import { Injectable, NotFoundException } from '@nestjs/common';
import { EnrollDto } from './dto/enrollment.dto';
import { EnrollmentRepository } from './repo/enrollment.repo';
import { EnrollmentTypes } from '../shared/enum/enrollment.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { queueNames } from 'src/common/queue';
import { Queue } from 'bullmq';
import { UserJobs } from 'src/user/shared/const/user.job';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    @InjectQueue(queueNames.USER) private readonly userQueue : Queue
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
 