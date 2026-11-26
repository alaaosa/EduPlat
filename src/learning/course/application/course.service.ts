import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
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
import { InstructerRepository } from 'src/instructer/repo/instructor';
import { StripeGateway } from 'src/payment/infrastructure/stripe/stripe.payment.gateway';
import { Action } from '../domain/enums/approv-enum';
import { ExamRepository } from 'src/assessment/infrastructure/repo/exam.repo';
import { ExamTypes } from 'src/assessment/domain/shared/enum/types-of-exam';
import { RedisCourse } from '../infrastructure/redis/handle.course';
import { PromiseAll } from 'src/common/functions/handle.promise.all';
import { EVENT_EMITTER2 } from '../domain/consts';
import type { IPushCourseEvent } from '../domain/interface/event.emitter';

@Injectable()
export class CourseService {
  constructor(
    @InjectConnection() private sequlize: Sequelize,
    private readonly meilisearchService: MeilisearchService,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly courseRepository: CourseRepository,
    private readonly examRepository: ExamRepository,
    private readonly instructerRepository: InstructerRepository,
    private readonly stripeGateway: StripeGateway,
    private readonly redisCourse: RedisCourse,
    @Inject(EVENT_EMITTER2) private readonly pushCourseEvent: IPushCourseEvent,
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

      await PromiseAll([
        this.courseRepository.createRequirements(
          requirements,
          createdCourse.id,
          transaction,
        ),
        this.courseRepository.createAudiences(
          audiences,
          createdCourse.id,
          transaction,
        ),
        this.courseRepository.createGoals(goals, createdCourse.id, transaction),
      ]);

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

  // user ownerguard
  // send course to admin for review
  async sendCourseForReview(
    courseId: number,
    instructorId: number,
    email: string,
  ) {
    const [course, states] = await PromiseAll([
      this.courseRepository.getCourseById(courseId),
      this.courseRepository.getCourseState(courseId),
    ]);
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

    this.pushCourseEvent.emit('course.review', {
      title: course.getTitle(),
      email,
      instructorId,
    });
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

        this.pushCourseEvent.emit('course.rejected', {
          instructerId: dto.instructerId,
          title: course.getTitle(),
          email: dto.instructerEmail,
          reason: dto.reason,
        });

        return;
      }

      course.updateStatusToPublish();

      await this.courseRepository.updateStatus(
        courseId,
        course.getStatus(),
        transaction,
      );
      await this.courseRepository.deleteReasonOfReject(courseId, transaction);

      this.pushCourseEvent.emit('course.published', {
        title: course.getTitle(),
        email: dto.instructerEmail,
        instructerId: dto.instructerId,
      });

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
    // const courseExist =
    //   await this.courseRepository.findForPreviewById(courseId);
    // if (!courseExist) throw new NotFoundException('Course not found');

    // set isEnrolled in cache when user complete payment process for course
    let isEnrolled =
      (await this.redisCourse.getIsEnrolled(userId, courseId)) === 'true';

    // ensure that user is enrolled or not from db
    if (!isEnrolled) {
      isEnrolled = await this.enrollmentRepo.findByCourseIdAndUserId(
        courseId,
        userId,
      );

      if (!isEnrolled) throw new ForbiddenException('not allowed for you !! ');

      // set userId in redis for 7 days
      await this.redisCourse.setIsEnrolled(userId, courseId);
    }
    //coursePreview => contains all sections ('id' , 'title' , 'description')
    // and lessons ("id" , "type" , "decription")

    const [coursePreview, finalExam] = await PromiseAll([
      this.courseRepository.coursePreview(courseId),
      this.examRepository.findExamDetails(courseId, ExamTypes.FINAL, userId),
    ]);

    if (!coursePreview || !finalExam)
      throw new NotFoundException('content not found');

    const allowed = [
      CourseStatus.ARCHIVED,
      CourseStatus.DELETED,
      CourseStatus.PUBLISHED,
    ];

    //if user enrolled in course and course is not published(archieved) then allow to view the course preview
    // ensure that users enrolled have access on the courses

    if (!allowed.includes(coursePreview.status))
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

  async getAllCoursesToHome() {
    const courses = await this.courseRepository.findAllPublishedCoursesToHome();
    return courses;
  }
}
