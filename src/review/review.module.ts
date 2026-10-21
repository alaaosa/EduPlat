import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './repo/review';
import { CourseRepository } from '../../learning/course/infrastructure/persistence/sequelize/course.repo';
import { EnrollmentRepository } from '../../enrollment/repo/enrollment.repo';
import { SequelizeModule } from '@nestjs/sequelize';
import { Review } from './entities/review.entity';

@Module({
  imports: [SequelizeModule.forFeature([Review])],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    ReviewRepository,
    CourseRepository,
    EnrollmentRepository,
  ],
})
export class ReviewModule {}
