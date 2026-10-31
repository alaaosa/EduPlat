import { Injectable, NotFoundException } from '@nestjs/common';
import { EnrollDto } from './dto/enrollment.dto';
import { EnrollmentRepository } from './repo/enrollment.repo';
import { EnrollmentTypes } from '../learning/course/domain/enums/enrollment.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly redis: RedisService,
  ) {}

  @OnEvent('payment.course.successfully')
  async enroll(dto: EnrollDto) {
    const { itemId, idempotency_key, userId } = dto;

    const key = await this.redis.client.set(
      idempotency_key,
      'true',
      'EX',
      1800,
      'NX',
    );

    if (!key) return;

    await this.enrollmentRepository.create(
      itemId,
      userId,
      idempotency_key,
      EnrollmentTypes.COMPELETE,
    );
  }
}
