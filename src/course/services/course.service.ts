import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepository } from '../repo/course.repo';
import {
  CreateCourseDto,
  updateCourseStatusDto,
} from '../dto/create-course.dto';
import { CourseStatus } from '../shared/enum';
import slug from 'slug';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MeilisearchService } from 'src/meilisearch/meilisearch.service';
import { checkCourseBeforeReview } from '../helper/course.validate';
import { FinalRepo } from 'src/assessment2/final/repo/final.repo';
import { EnrollmentRepository } from '../enrollment/repo/enrollment.repo';
import { RedisService } from 'src/redis/redis.service';
import { LessonRepository } from 'src/lesson/repo/lesson.repo';
import { CourseProgressService } from '../progress/course-progress.service';
import { InstructerRepository } from 'src/instructer/repo/instructor';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);
  constructor(
    @InjectConnection() private sequlize: Sequelize,
    private readonly meilisearchService: MeilisearchService,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly courseRepository: CourseRepository,
    private readonly finalRepo: FinalRepo,
    private readonly redisService: RedisService,
    private readonly courseProgressService: CourseProgressService,
    private readonly paymentService: PaymentService,
  ) {}

  async saveAsDraft(dto: CreateCourseDto, instructorId: number) {
    const {
      title,
      description,
      image,
      language,
      category,
      level,
      requirements,
      audiences,
      goals,
    } = dto;

    if (!title) {
      throw new BadRequestException('Course title is required');
    }
    await this.validateCourseTitle(title, instructorId);

    const course = await this.sequlize.transaction(async (transaction) => {
      const coursePayload = {
        title,
        slug: slug(title),
        instructerId: instructorId,
        status: CourseStatus.DRAFT,
        description,
        thumbnail: image?.url,
        public_id: image?.public_id,
        language,
        category,
        level,
      };

      const createdCourse = await this.courseRepository.create(
        coursePayload,
        transaction,
      );

      if (requirements && requirements.length > 0) {
        await this.courseRepository.createRequirements(
          requirements,
          createdCourse.id,
          transaction,
        );
      }
      if (audiences && audiences.length > 0) {
        await this.courseRepository.createAudiences(
          audiences,
          createdCourse.id,
          transaction,
        );
      }
      if (goals && goals.length > 0) {
        await this.courseRepository.createGoals(
          goals,
          createdCourse.id,
          transaction,
        );
      }

      return createdCourse;
    });

    return course;
  }

  async addPrice(instructerId: number, courseId: number, price: number) {
    await this.courseRepository.createPrice(courseId, { price }, instructerId);
  }

  private async validateCourseTitle(title: string, instructorId: number) {
    if (!title) {
      throw new BadRequestException('Course title is required');
    }

    const titleExist = await this.courseRepository.existsByTitleAndInstructor(
      title,
      instructorId,
    );
    if (titleExist) {
      throw new ConflictException(
        'A course with this title already exists for this instructor',
      );
    }

    return true;
  }

  async asyncCourses() {
    const courses = await this.courseRepository.syncAllCourses();
    const searchableCourses = courses.map((course) => {
      const data = course;

      return {
        id: course.id,
        title: data.title,
        price: course.price,
        thumbnail: course.thumbnail,
        description: course.description,
        level: course.level,
        category: course.category,
        instructer_name: course.instructor.user.name,
        course_duration: course['course_duration'] as number,
      };
    });

    const index = this.meilisearchService.getIndex('courses');

    await index.addDocuments(searchableCourses);
  }

  // send course to admin for review
  async sendCourseForReview(courseId: number, instructorId: number) {
    const course = await this.courseRepository.findForReviewById(courseId);

    if (!course) throw new NotFoundException('Course not found');

    if (!course.instructor.stripeAccountId)
      throw new ForbiddenException(
        'connect your stripe account first to send course for review',
      );
    if (course.instructerId !== instructorId)
      throw new BadRequestException(
        'You are not authorized to send this course for review',
      );

    if (course.sections.length === 0)
      throw new NotAcceptableException('at least one section in course');

    await this.paymentService.checkInstructerCapability(instructorId);

    if (
      course.status === CourseStatus.DRAFT ||
      course.status === CourseStatus.REJECTED
    ) {
      await checkCourseBeforeReview(course);
      await this.courseRepository.updateStatus(
        courseId,
        CourseStatus.PENDING_REVIEW,
      );
    }
    throw new BadRequestException(
      'Course is already sent for review or published, cannot send again',
    );
  }

  // update course status by admin
  async updateCourseStatus(
    adminId: number,
    courseId: number,
    dto: updateCourseStatusDto,
  ) {
    const course =
      await this.courseRepository.findByIdAndCourseReject(courseId);
    if (!course) throw new NotFoundException('Course not found');

    if (course.status !== CourseStatus.PENDING_REVIEW)
      throw new BadRequestException(
        'Published courses cannot be updated to another status',
      );

    const db_update = await this.sequlize.transaction(async (transaction) => {
      if (course.courseReject) {
        if (dto.action === 'approve') {
          await Promise.all([
            this.courseRepository.deleteReject(
              course.courseReject.id,
              transaction,
            ),
            this.courseRepository.updateStatus(
              courseId,
              CourseStatus.PUBLISHED,
              transaction,
            ),
          ]);
        } else if (dto.action === 'reject') {
          await this.courseRepository.updateReject(
            course.courseReject.id,
            dto.reason,
            transaction,
          );
        }
      } else if (!course.courseReject && dto.action === 'approve') {
        await this.courseRepository.updateStatus(
          courseId,
          CourseStatus.PUBLISHED,
        );
      } else if (!course.courseReject && dto.action === 'reject') {
        await this.courseRepository.createCourseReject(
          courseId,
          dto.reason,
          transaction,
        );

        await this.courseRepository.updateStatus(
          courseId,
          CourseStatus.REJECTED,
        );
      }
    });

    return db_update;
  }

  // get all course for view to user
  async getAllPublishedCourses(page: number = 1, limit: number = 10) {
    const courses = await this.courseRepository.findAllPublishedCourses(
      page,
      limit,
    );
    if (courses.length === 0)
      throw new NotFoundException('No published courses available');

    return courses;
  }

  // get courses to instructer
  async getCoursesByInstructer(
    page: number = 1,
    limit: number = 4,
    instructerId: number,
  ) {
    const courses = await this.courseRepository.getCoursesByInstructer(
      instructerId,
      page,
      limit,
    );
    if (courses.length === 0)
      throw new NotFoundException('No courses available for this instructer');

    return courses;
  }

  // get all sections and final exam for a course for enrolled user
  async getCoursePreview(courseId: number, userId: number) {
    const courseExist =
      await this.courseRepository.findForPreviewById(courseId);
    if (!courseExist) throw new NotFoundException('Course not found');

    let isEnrolled =
      (await this.redisService.client
        .get(`enrolled:${userId.toString()}:${courseId.toString()}`)
        .catch((err) => {
          this.logger.error('get enroll case is fail');
          return null;
        })) === 'true';

    // ensure that user is enrolled or not from db
    if (!isEnrolled) {
      isEnrolled = await this.enrollmentRepo.findByCourseIdAndUserId(
        courseId,
        userId,
      );

      if (!isEnrolled) throw new ForbiddenException('not allowed for you');

      await this.redisService.client
        .set(
          `enrolled:${userId.toString()}:${courseId.toString()}`,
          JSON.stringify(isEnrolled),
          'EX',
          7 * 24 * 60 * 60,
        )
        .catch((err) => {
          this.logger.error("can't write in cache");
        }); // set userId in redis for 7 days
    }
    //coursePreview => contains all sections ('id' , 'title' , 'description')
    // and lessons ("id" , "type" , "decription")
    const [coursePreview, finalExam] = await Promise.all([
      this.courseRepository.coursePreview(courseId),
      this.finalRepo.findFinalByCourseId(courseId),
    ]).catch((err) => {
      if (err instanceof HttpException)
        throw { message: err.message, status: err.getStatus, cause: err.cause };
      throw new BadRequestException(err);
    });

    if (!coursePreview || !finalExam)
      throw new NotFoundException('content not found');

    //if user enrolled in course and course is not published(archieved) then allow to view the course preview
    // ensure that users enrolled have access on the courses
    if (
      courseExist.status === CourseStatus.ARCHIVED ||
      courseExist.status === CourseStatus.DELETED
    ) {
      return {
        coursePreview,
        finalExam,
      };
    }
    if (courseExist.status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException('not allowed to view this course');
    }

    return {
      coursePreview,
      finalExam,
    };
  }

  // soft delete course by instructer
  async deleteCourse(courseId: number, instructerId: number) {
    const course = await this.courseRepository.findCourseToDelete(
      courseId,
      instructerId,
    );
    if (!course) throw new NotFoundException('Course not found ');

    if (
      course.status === CourseStatus.REJECTED ||
      course.status === CourseStatus.PENDING_REVIEW ||
      course.status === CourseStatus.DRAFT
    ) {
      await this.courseRepository.hardDeleteCourse(courseId, instructerId);
      return true;
    }

    return this.sequlize.transaction(async (transaction) => {
      const deleteCourse = await this.courseRepository.softDeleteCourse(
        courseId,
        instructerId,
        transaction,
      );

      if (!deleteCourse)
        throw new NotFoundException(
          'Course not found or you are not authorized to delete this course',
        );

      await this.courseRepository.updateStatus(
        courseId,

        CourseStatus.DELETED,

        transaction,
      );

      return true;
    });
  }

  async verifyCourseStudentCompleted(courseId: number, userId: number) {
    return this.courseProgressService.verifyCourseProgress(courseId, userId);
  }
}
