import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { CourseRepository } from 'src/learning/course/infrastructure/persistence/sequelize/course.repo';

@Injectable()
export class CheckoutService {
  constructor(private readonly courseRepository: CourseRepository) {}

  async courseCheckOut(courseId: number, req: Request) {
    const course = await this.courseRepository.findCheckOutData(courseId);

    if (!course) throw new NotFoundException('course not found');

    const price_session = req.session.pricing;

    if (price_session && price_session.courseId == courseId) {
      return {
        ...course,
        price: price_session.price,
      };
    }
    return course;
  }
}
