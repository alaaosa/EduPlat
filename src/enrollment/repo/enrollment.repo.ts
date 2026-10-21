import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Enrollment } from '../entities/enrollment.entity';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes } from 'sequelize';
import { EnrollmentTypes } from 'src/learning/course/domain/enums/enrollment.enum';
import { Course } from 'src/learning/course/infrastructure/persistence/models/course.entity';
import { Progress as CourseProgress } from 'src/learning/course/infrastructure/persistence/models/progress';
import { User } from 'src/user/entities/user.entity';

type creationEnrollment = Omit<CreationAttributes<Enrollment>, ''>;

export interface DashboardCourseRecord {
  id: number;
  title: string | null;
  thumbnail: string | null;
  instructor: { name: string } | null;
  progress: { progressPercentage: number; completed: boolean } | null;
}

export interface DashboardCourseStats {
  total: number;
  completed: number;
  inProgress: number;
  enrolledCourses: DashboardCourseRecord[];
}

@Injectable()
export class EnrollmentRepository {
  constructor(
    private readonly exceptionHandler: HandleException,
    @InjectModel(Enrollment)
    private readonly enrollmentModel: typeof Enrollment,
  ) {}

  findById(id: number) {
    return this.exceptionHandler.handle(async () => {
      return this.enrollmentModel.findByPk(id);
    });
  }

  /**
   * @param courseId
   * @param userId
   * @param enrollmentType
   * @returns record the enrollment
   */

  create(courseId: number, userId: number, enrollmentType: EnrollmentTypes) {
    return this.exceptionHandler.handle(async () =>
      this.enrollmentModel.create({ userId, enrollmentType, courseId }),
    );
  }

  countNumOfCourseEnrollment(courseId: number, userId: number) {
    return this.exceptionHandler.handle(async () =>
      this.enrollmentModel.count({ where: { courseId, userId } }),
    );
  }

  findByCourseIdAndUserId(courseId: number, userId: number) {
    return this.exceptionHandler.handle(async () => {
      const isEnrolled = await this.enrollmentModel.findOne({
        where: { courseId, userId },
        attributes: ['id'],
      });

      return !!isEnrolled;
    });
  }

  getDashboardCourseStats(userId: number): Promise<DashboardCourseStats> {
    return this.exceptionHandler.handle(async () => {
      const enrollments = await this.enrollmentModel.findAll({
        where: { userId },
        attributes: ['courseId'],
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'thumbnail'],
            required: true,
            include: [
              {
                model: User,
                as: 'instructer',
                attributes: ['name'],
                required: false,
              },
              {
                model: CourseProgress,
                as: 'progresses',
                attributes: ['progressPercentage', 'completed'],
                where: { userId },
                required: false,
              },
            ],
          },
        ],
      });

      const enrolledCourses = enrollments.map((enrollment) => {
        const course = enrollment.course;
        const progress = course.progresses?.[0];
        return {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail ?? null,
          instructor: course.instructor
            ? { name: course.instructor.user.name }
            : null,
          progress: progress
            ? {
                progressPercentage: progress.progressPercentage,
                completed: progress.completed,
              }
            : null,
        };
      });
      const total = enrolledCourses.length;
      const completed = enrolledCourses.filter(
        (course) => course.progress?.completed === true,
      ).length;

      return {
        total,
        completed,
        inProgress: total - completed,
        enrolledCourses,
      };
    });
  }

  /**
   * @param instructerId
   * @returns the total number of students for the given instructor
   */
  getTotalStudentsCount(instructerId: number) {
    return this.exceptionHandler.handle(async () =>
      this.enrollmentModel.count({
        col: 'userId',
        include: [
          {
            model: Course,
            as: 'course',
            where: { instructerId },
            attributes: [],
            required: true,
          },
        ],
      }),
    );
  }
}
