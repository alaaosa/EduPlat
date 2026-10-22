import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './repo/review';
import { EnrollmentRepository } from '../enrollment/repo/enrollment.repo';
import { SequelizeModule } from '@nestjs/sequelize';
import { Review } from './entities/review.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { HandleException } from '../db/db.service';
import { CourseProgressModule } from '../learning/course/course-progress.module';
import { Course } from '../learning/course/infrastructure/persistence/models/course.entity';

@Module({
  imports: [SequelizeModule.forFeature([Review, Enrollment, Course]), CourseProgressModule],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    ReviewRepository,
    EnrollmentRepository,
    HandleException,
  ],
})
export class ReviewModule {}
