import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepository } from '../infrastructure/persistence/sequelize/course.repo';
import {
  AddPriceDTO,
  CreateCourseDto,
  updateCourseStatusDto,
} from '../presentation/dto/create-course.dto';
import { CourseStatus } from '../domain/enums';
import slug from 'slug';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MeilisearchService } from 'src/meilisearch/meilisearch.service';
import { EnrollmentRepository } from '../../../enrollment/repo/enrollment.repo';
import { RedisService } from 'src/redis/redis.service';
import { CourseProgressService } from './course-progress.service';
import { InstructerRepository } from 'src/instructer/repo/instructor';
import { StripeGateway } from 'src/payment/infrastructure/stripe/stripe.payment.gateway';
import { Action } from '../domain/enums/approv-enum';
import { ExamRepository } from 'src/assessment/infrastructure/repo/exam.repo';
import { ExamTypes } from 'src/assessment/domain/enum/types-of-exam';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);
  constructor(
    @InjectConnection() private sequlize: Sequelize,
    private readonly meilisearchService: MeilisearchService,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly courseRepository: CourseRepository,
    private readonly examRepository: ExamRepository,
    private readonly redisService: RedisService,
    private readonly courseProgressService: CourseProgressService,
    private readonly instructerRepository: InstructerRepository,
    private readonly stripeGateway: StripeGateway,
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
        thumbnail: image.url,
        public_id: image.public_id,
        language,
        category,
        level,
      };

      const createdCourse = await this.courseRepository.create(
        coursePayload,
        transaction,
      );

      await this.courseRepository.createRequirements(
        requirements,
        createdCourse.id,
        transaction,
      );

      await this.courseRepository.createAudiences(
        audiences,
        createdCourse.id,
        transaction,
      );

      await this.courseRepository.createGoals(
        goals,
        createdCourse.id,
        transaction,
      );

      return createdCourse;
    });

    return course;
  }

  async addPrice(instructerId: number, courseId: number, dto: AddPriceDTO) {
    await this.courseRepository.createPrice(
      courseId,
      { price: dto.price },
      instructerId,
    );
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

  ///// review /////
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
    const course = await this.courseRepository.getCourseById(courseId);

    const states = await this.courseRepository.getCourseState(courseId);
    course.check(states);

    const instructer =
      await this.instructerRepository.getAccountIdByInstructerId(instructorId);

    if (!instructer || !instructer.stripeAccountId)
      throw new ForbiddenException(
        'connect your stripe account first to send course for review',
      );

    const capability = await this.stripeGateway.checkAccountCapability(
      instructer.stripeAccountId,
    );

    if (!capability)
      throw new BadGatewayException('account not supported receive money !!');

    const status = course.updateStatusToPending();
    await this.courseRepository.updateStatus(courseId, status);
    return;
  }

  // update course status by admin
  async updateCourseStatus(courseId: number, dto: updateCourseStatusDto) {
    const course = await this.courseRepository.getCourseById(courseId);

    const transaction = await this.sequlize.transaction(async (transaction) => {
      if (dto.action === Action.REJECT) {
        course.changeStatusToRejected();
        await this.courseRepository.updateStatus(
          courseId,
          course.getStatus(),
          transaction,
        );
        await this.courseRepository.createCourseReject(
          courseId,
          dto.reason,
          transaction,
        );

        return;
      }

      course.updateStatusToPublish();

      await this.courseRepository.updateStatus(
        courseId,
        course.getStatus(),
        transaction,
      );
      await this.courseRepository.deleteReasonOfReject(courseId, transaction);
      return;
    });

    return transaction;
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

    // set isEnrolled in cache when user complete payment process for course
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

      if (!isEnrolled) throw new ForbiddenException('not allowed for you !! ');

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
      this.examRepository.findExamDetails(courseId, ExamTypes.FINAL, userId),
    ]).catch((err) => {
      throw new BadRequestException(err);
    });

    if (!coursePreview || !finalExam)
      throw new NotFoundException('content not found');

    const allowed = [
      CourseStatus.ARCHIVED,
      CourseStatus.DELETED,
      CourseStatus.PUBLISHED,
    ];

    //if user enrolled in course and course is not published(archieved) then allow to view the course preview
    // ensure that users enrolled have access on the courses

    if (!allowed.includes(courseExist.status))
      throw new BadRequestException('not allowed to view this course');

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

  async getAllCoursesToHome() {
    const courses = await this.courseRepository.findAllPublishedCoursesToHome();
    return courses;
  }
}
