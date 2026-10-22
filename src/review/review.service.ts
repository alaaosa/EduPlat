import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRepository } from './repo/review';
import { CreateReviewDto } from './dto/create-review.dto';
import { EnrollmentRepository } from '../enrollment/repo/enrollment.repo';
import { CourseRepository } from '../learning/course/infrastructure/persistence/sequelize/course.repo';
import { CourseStatus } from '../learning/course/domain/enums';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async create(reviewDTO: CreateReviewDto, userId: number, courseId: number) {
    const [course, enrollment] = await Promise.all([
      this.courseRepository.findCourseForReviewAndComments(courseId),
      this.enrollmentRepository.findByCourseIdAndUserId(courseId, userId),
    ]);

    if (!course || !enrollment || course.status !== CourseStatus.PUBLISHED)
      throw new BadRequestException(
        'You are not allowed to review this course',
      );

    const review = await this.reviewRepository.create(
      reviewDTO,
      userId,
      courseId,
    );

    return review;
  }

  async getAllReview(courseId: number) {
    const [reviews, dataAboutReviews] = await Promise.all([
      this.reviewRepository.getAllReviewsByCourseId(courseId),
      this.reviewRepository.getTotalReview(courseId),
    ]);
    if (reviews.length === 0) throw new NotFoundException('not found reviews');

    return { reviews, dataAboutReviews };
  }
}
