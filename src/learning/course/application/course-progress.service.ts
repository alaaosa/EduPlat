import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepository } from '../infrastructure/persistence/sequelize/course.repo';
import { CourseProgressRepository } from '../infrastructure/persistence/sequelize/course-progress.repo';

@Injectable()
export class CourseProgressService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly courseProgressRepository: CourseProgressRepository,
  ) {}

  async verifyCourseProgress(courseId: number, userId: number) {
    const course = await this.courseRepository.findCourseToProgress(
      courseId,
      userId,
    );
    if (!course) throw new NotFoundException('Course not found');
    if (course.enrollments.length === 0) {
      throw new ForbiddenException('not allowed for you');
    }

    const {
      totalVideos: totalRequiredVideos,
      completedVideos,
      totalQuizzes: totalRequiredQuizzes,
      completedQuizzes,
    } = await this.courseRepository.getCourseProgressCounts(courseId, userId);

    const totalRequiredItems = totalRequiredVideos + totalRequiredQuizzes;
    const completedItems = completedVideos + completedQuizzes;
    const completed =
      totalRequiredItems > 0 &&
      completedVideos === totalRequiredVideos &&
      completedQuizzes === totalRequiredQuizzes;
    const progressPercentage = totalRequiredItems
      ? (completedItems / totalRequiredItems) * 100
      : 0;

    await this.courseProgressRepository.updateProgress({
      userId,
      courseId,
      progressPercentage,
      completed,
    });

    return {
      progressPercentage,
      finalEligible: completed,
    };
  }

  async assertFinalEligible(courseId: number, userId: number) {
    const progress = await this.verifyCourseProgress(courseId, userId);
    if (!progress.finalEligible)
      throw new ForbiddenException(
        'Complete the course before starting the final',
      );
  }
}
