import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Review } from '../entities/review.entity';
import { CreationAttributes, Sequelize, Transaction } from 'sequelize';
import { HandleException } from 'src/db/db.service';
import { User } from 'src/user/entities/user.entity';
import { CourseRepository } from 'src/learning/course/infrastructure/persistence/sequelize/course.repo';
import { Course } from 'src/learning/course/infrastructure/persistence/models/course.entity';

@Injectable()
export class ReviewRepository {
  constructor(
    private readonly exceptionHandler: HandleException,
    @InjectModel(Review) private readonly reviewModel: typeof Review,
    @InjectConnection() private readonly sequlize: Sequelize,
    @InjectModel(Course) private readonly courseModel: typeof Course,
  ) {}
  create(
    data: Omit<CreationAttributes<Review>, 'userId' | 'courseId'>,
    userId: number,
    courseId: number,
    transaction?: Transaction,
  ) {
    return this.exceptionHandler.handle(async () => {
      await this.reviewModel.create(
        { ...data, userId, courseId },
        { transaction },
      );
      await this.courseModel.increment('numOfReviews', {
        by: 1,
        where: { id: courseId },
        transaction,
      });

      await this.courseModel.increment('sumRating', {
        by: data.rating,
        where: { id: courseId },
        transaction,
      });

      await this.courseModel.update(
        {
          avgRating: this.sequlize.literal(`(sumRating) / (numOfReviews)`),
        },
        { where: { id: courseId }, transaction },
      );
    });
  }

  getAllReviewsByCourseId(courseId: number) {
    return this.exceptionHandler.handle(async () => {
      return this.reviewModel.findAll({
        where: { courseId },
        attributes: ['id', 'comment', 'rating', 'createdAt'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name'],
          },
        ],
      });
    });
  }

  getTotalReview(courseId: number) {
    return this.exceptionHandler.handle(async () =>
      this.reviewModel.findOne({
        where: { courseId },
        attributes: [
          [
            this.sequlize.fn('AVG', this.sequlize.col('rating')),
            'averageRating',
          ],

          [this.sequlize.fn('COUNT', this.sequlize.col('id')), 'reviewsCount'],
        ],
        raw: true,
      }),
    );
  }
}
