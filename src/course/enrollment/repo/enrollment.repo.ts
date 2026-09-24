import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Enrollment } from '../entities/enrollment.entity';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes } from 'sequelize';
import { EnrollmentTypes } from 'src/course/shared/enum/enrollment.enum';

type creationEnrollment = Omit<CreationAttributes<Enrollment>, ''>;
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
        attributes:['id']
      });

      return !!isEnrolled;
    });
  }

 

  
}
