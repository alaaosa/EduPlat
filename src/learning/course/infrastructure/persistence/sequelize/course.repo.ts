import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Course } from '../models/course.entity';
import { Section } from '../models/section.entity';
import { HandleException } from 'src/db/db.service';
import {
  CreationAttributes,
  QueryTypes,
  Sequelize,
  Transaction,
} from 'sequelize';
import { CourseRequirement } from 'src/learning/course/infrastructure/persistence/models/course_items/course.requirements';
import { CourseGoal } from 'src/learning/course/infrastructure/persistence/models/course_items/course.goal';
import { CourseAudience } from 'src/learning/course/infrastructure/persistence/models/course_items/course.audience';
import { Lesson } from 'src/lesson/models/lesson.model';
import { User } from 'src/user/entities/user.entity';
import { CourseReject } from '../models/course.reject';
import { Enrollment } from '../../../../../enrollment/entities/enrollment.entity';
import { Video } from 'src/lesson/models/types/video.model';
import { Progress as VideoProgress } from 'src/lesson/models/lesson.user';
import { CourseStatus } from '../../../domain/enums';
import { Instructer } from 'src/instructer/entities/instructer';
import {
  CourseEntity,
  PublishStats,
} from 'src/learning/course/domain/entities/course.entity';
import { model } from 'mongoose';

@Injectable()
export class CourseRepository {
  private readonly courseRelations = [
    {
      model: Section,
    },
  ];

  constructor(
    private readonly handleException: HandleException,
    @InjectModel(Course)
    private readonly courseModel: typeof Course,
    @InjectModel(CourseRequirement)
    private readonly requirementModel: typeof CourseRequirement,
    @InjectModel(CourseAudience)
    private readonly audienceModel: typeof CourseAudience,
    @InjectModel(CourseGoal)
    private readonly goalModel: typeof CourseGoal,
    @InjectModel(CourseReject)
    private readonly courseRejectModel: typeof CourseReject,
    @InjectModel(Video) private readonly videoModel: typeof Video,

    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  create(
    course: Omit<CreationAttributes<Course>, ''>,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.courseModel.create(course, { transaction });
    });
  }

  findById(id: number) {
    return this.handleException.handle(async () => {
      return this.courseModel.findByPk(id);
    });
  }

  findForPreviewById(id: number) {
    return this.handleException.handle(async () => {
      return this.courseModel.findByPk(id, {
        attributes: ['id', 'status'],
      });
    });
  }
  findForReviewById(id: number) {
    return this.handleException.handle(async () => {
      return this.courseModel.findByPk(id, {
        attributes: ['id', 'status', 'instructerId'],
        include: [
          {
            model: Section,
            as: 'sections',
            attributes: [],
            include: [
              {
                model: Lesson,
                as: 'lessons',
                attributes: [],
              },
            ],
          },
          {
            model: Instructer,
            as: 'instructor',
            attributes: ['stripeAccountId'],
            required: true,
          },
        ],
      });
    });
  }

  getCourseById(id: number) {
    return this.handleException.handle(async () => {
      const course = await this.courseModel.findOne({
        where: { id },
        attributes: [
          'id',
          'title',
          'category',
          'level',
          'language',
          'status',
          'price',
          'description',
          'thumbnail',
        ],
      });
      if (!course) throw new NotFoundException('course not found');
      return CourseEntity.instance(course);
    });
  }

  findAll() {
    return this.handleException.handle(async () => {
      return this.courseModel.findAll({
        include: this.courseRelations,
      });
    });
  }

  findByIdAndCourseReject(id: number) {
    return this.handleException.handle(async () => {
      return this.courseModel.findByPk(id, {
        attributes: [],
        include: [
          {
            model: CourseReject,
            as: 'courseReject',
            attributes: ['id', 'reason'],
            required: false,
          },
        ],
      });
    });
  }

  findAllToIndexed() {
    return this.handleException.handle(async () =>
      this.courseModel.findAll({
        include: [
          {
            model: User,
            as: 'instructer',
          },
        ],
      }),
    );
  }

  ////////////////////////// review /////////////
  syncAllCourses() {
    return this.handleException.handle(async () =>
      this.courseModel.findAll({
        attributes: [
          [
            Sequelize.literal(`(
            SELECT COALESCE(SUM(videos.duration), 0)
            FROM videos AS videos
            INNER JOIN Lessons AS lessons
              ON lessons.id = videos.lessonId
            INNER JOIN Sections AS sections
              ON sections.id = lessons.sectionId
            WHERE sections.courseId = Course.id
          )`),
            'course_duration',
          ],
          'id',
          'title',
          'price',
          'thumbnail',
          'description',
          'level',
          'category',
        ],
        include: [
          {
            model: User,
            as: 'instructer',
            attributes: ['name'],
          },
        ],
      }),
    );
  }

  findBySlug(slug: string) {
    return this.handleException.handle(async () => {
      return this.courseModel.findOne({
        where: { slug },
        include: this.courseRelations,
      });
    });
  }

  exists(id: number) {
    return this.handleException.handle(async () => {
      const count = await this.courseModel.count({
        where: { id },
      });
      return count > 0;
    });
  }

  existsByTitleAndInstructor(title: string, instructorId: number) {
    return this.handleException.handle(async () => {
      const count = await this.courseModel.count({
        where: {
          title,
          instructerId: instructorId,
        },
      });

      return count > 0;
    });
  }

  createPrice(
    id: number,
    values: Partial<CreationAttributes<Course>>,
    instructerId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.courseModel.update(values, {
        where: { id, instructerId },
        transaction,
      });
    });
  }
  updateStatus(id: number, status: CourseStatus, transaction?: Transaction) {
    return this.handleException.handle(async () => {
      return this.courseModel.update(
        { status },
        {
          where: { id },
          transaction,
        },
      );
    });
  }

  delete(id: number) {
    return this.handleException.handle(async () => {
      return this.courseModel.destroy({
        where: { id },
      });
    });
  }

  changeStatus(id: number) {
    return this.handleException.handle(async () =>
      this.courseModel.findByPk(id, {
        attributes: [],
      }),
    );
  }

  createRequirements(
    requirements: Omit<CreationAttributes<CourseRequirement>, 'courseId'>[],
    courseId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.requirementModel.bulkCreate(
        requirements.map((requirement) => ({
          ...requirement,
          courseId,
        })),
        { transaction },
      );
    });
  }

  createGoals(
    goals: Omit<CreationAttributes<CourseGoal>, 'courseId'>[],
    courseId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.goalModel.bulkCreate(
        goals.map((goal) => ({
          ...goal,
          courseId,
        })),
        { transaction },
      );
    });
  }

  getInstructerId(courseId: number) {
    return this.handleException.handle(async () =>
      this.courseModel.findByPk(courseId, { attributes: ['instructerId'] }),
    );
  }

  createAudiences(
    audiences: Omit<CreationAttributes<CourseAudience>, 'courseId'>[],
    courseId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.audienceModel.bulkCreate(
        audiences.map((audience) => ({
          ...audience,
          courseId,
        })),
        { transaction },
      );
    });
  }

  isExist(courseId: number) {
    return this.handleException.handle(async () =>
      this.courseModel.findByPk(courseId, {
        attributes: ['id', 'price', 'instrcuterId'],
      }),
    );
  }

  getCourseState(courseId: number): Promise<PublishStats> {
    return this.handleException.handle(async () => {
      const [raw] = await this.sequelize.query<PublishStats>(
        `
        SELECT(
        (SELECT COUNT(id) FROM sections as s WHERE s.courseId = :id) as numOfSections ,
         (SELECT COUNT(*) FROM sections s WHERE s.courseId = :id
          AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.sectionId = s.id)) AS numEmptySections,
          (SELECT COUNT(id) FROM course_requirements as cr  WHERE cr.courseId = :courseId) as numRequirements ,
          (SELECT COUNT(id) FROM course_goals as cg  WHERE cg.courseId = :courseId) as numGoals,
          (SELECT COUNT(id) FROM course_audience as cg  WHERE cg.courseId = :courseId) as numAudiences    
        )
        `,
        { replacements: { id: courseId }, type: QueryTypes.SELECT },
      );
      return raw;
    });
  }

  findCourseToSection(id: number, instructerId: number) {
    return this.handleException.handle(async () =>
      this.courseModel.findOne({ where: { id, instructerId }, attributes: [] }),
    );
  }

  findInstructerIdFromCourse(courseId: number) {
    return this.handleException.handle(async () =>
      this.courseModel.findByPk(courseId, { attributes: ['instructerId'] }),
    );
  }

  findCoursesToHome(){

  }

  async findCheckOutData(courseId: number) {
    return this.handleException.handle(async () =>
      this.courseModel.findOne({
        where: { id: courseId },

        attributes: [
          'id',
          'title',
          'thumbnail',
          'level',
          'price',
          [
            Sequelize.literal(`(
            SELECT COUNT(*)
            FROM lessons AS lessons
            INNER JOIN Sections AS sections
              ON sections.id = lessons.sectionId
            WHERE sections.courseId = Course.id
          )`),
            'lessonsCount',
          ],
          [
            Sequelize.literal(`(
            SELECT COALESCE(SUM(videos.duration), 0)
            FROM videos AS videos
            INNER JOIN Lessons AS lessons
              ON lessons.id = videos.lessonId
            INNER JOIN Sections AS sections
              ON sections.id = lessons.sectionId
            WHERE sections.courseId = Course.id
          )`),
            'courseDuration',
          ],
          [Sequelize.col('instructer.instructerId'), 'instructorId'],
          [Sequelize.col('instructer.stripeAccountId'), 'stripeAccountId'],

          // User fields
          [Sequelize.col('instructer.user.name'), 'instructorName'],
        ],
        include: [
          {
            model: Instructer,
            as: 'instructer',
            attributes: [],
            required: true,
            include: [
              {
                model: User,
                as: 'user',
                attributes: [],
              },
            ],
          },
        ],
        raw: true,
        // => ex { instructer: { id: 1, name: 'John Doe' } }
      }),
    );
  }

  coursePreview(id: number, transaction?: Transaction) {
    return this.handleException.handle(async () =>
      this.courseModel.findOne({
        where: { id },
        transaction,
        include: [
          {
            model: Section,
            as: 'sections',
            attributes: ['id', 'title', 'description'],
            include: [
              {
                model: Lesson,
                as: 'lessons',
                attributes: ['id', 'type', 'order'],
                required: false,
              },
            ],
          },
        ],
      }),
    );
  }

  private countOfCourseExams(courseId: number) {
    return this.handleException.handle(async () => {
      const course = await this.courseModel.findByPk(courseId, {
        attributes: [],
        include: [
          {
            model: Section,
            as: 'sections',
            attributes: {
              include: [
                [
                  this.sequelize.literal(`(
              SELECT COUNT(*)
              FROM exams AS e
              INNER JOIN lessons AS l ON l.id = e.itemId
              WHERE l.sectionId = sections.id
                AND e.examType = 'quiz'
            )`),
                  'num_of_quizzes',
                ],
              ],
            },
          },
        ],
      });

      if (!course) throw new NotFoundException();

      const sum = course.sections.reduce(
        (total, section) => total + Number(section['num_of_quizzes']),
        1, // 1 => final exam
      );

      return sum;
    });
  }
  private countOfCourseExamsCompleted(courseId: number) {
    return this.handleException.handle(async () => {
      const course = await this.courseModel.findByPk(courseId, {
        attributes: [],
        include: [
          {
            model: Section,
            as: 'sections',
            attributes: {
              include: [
                [
                  this.sequelize.literal(`(
                SELECT COUNT(*)
                FROM exams AS e
                INNER JOIN lessons AS l ON l.id = e.itemId
                WHERE l.sectionId = sections.id
                  AND e.examType = 'quiz'
                  AND EXISTS (
                    SELECT 1
                    FROM grades AS g
                    WHERE g.examId = e.id
                  )
                )`),
                  'quiz_completd',
                ],
              ],
            },
          },
        ],
      });

      if (!course) throw new NotFoundException();

      const sum = course.sections.reduce(
        (total, section) => total + Number(section['quiz_completd']),
        1, // 1 => final exam
      );

      return sum;
    });
  }

  getCourseProgressCounts(courseId: number, userId: number) {
    const videoCourseInclude = {
      model: Lesson,
      as: 'lesson',
      attributes: [],
      required: true,
      include: [
        {
          model: Section,
          as: 'section',
          attributes: [],
          where: { courseId },
          required: true,
        },
      ],
    };

    return this.handleException.handle(async () => {
      const [totalVideos, completedVideos, totalQuizzes, completedQuizzes] =
        await Promise.all([
          this.videoModel.count({
            include: [videoCourseInclude],
            distinct: true,
          }),
          this.videoModel.count({
            include: [
              videoCourseInclude,
              {
                model: VideoProgress,
                as: 'progress',
                attributes: [],
                where: { userId, completed: true },
                required: true,
              },
            ],
            distinct: true,
          }),

          this.countOfCourseExams(courseId),
          this.countOfCourseExamsCompleted(courseId),
        ]);

      return { totalVideos, completedVideos, totalQuizzes, completedQuizzes };
    });
  }

  incrementLessonsCount(courseId: number, transaction?: Transaction) {
    return this.handleException.handle(async () =>
      this.courseModel.increment('numOfLessons', {
        by: 1,
        where: { id: courseId },
        transaction,
      }),
    );
  }

  findRequirementsByCourseId(courseId: number) {
    return this.handleException.handle(async () => {
      return this.requirementModel.findAll({
        where: { courseId },
      });
    });
  }

  findGoalsByCourseId(courseId: number) {
    return this.handleException.handle(async () => {
      return this.goalModel.findAll({
        where: { courseId },
      });
    });
  }

  findAudiencesByCourseId(courseId: number) {
    return this.handleException.handle(async () => {
      return this.audienceModel.findAll({
        where: { courseId },
      });
    });
  }

  createCourseReject(
    courseId: number,
    reason: string,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.courseRejectModel.create(
        {
          courseId,
          reason,
        },
        { transaction },
      );
    });
  }

  deleteReject(courseRejectId: number, transaction?: Transaction) {
    return this.handleException.handle(async () => {
      return this.courseRejectModel.destroy({
        where: { id: courseRejectId },
        transaction,
      });
    });
  }

  updateReject(
    courseRejectId: number,
    reason: string,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.courseRejectModel.update(
        { reason },
        {
          where: { id: courseRejectId },
          transaction,
        },
      );
    });
  }
  createReasonOfReject(
    courseId: number,
    reason: string,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.courseRejectModel.upsert({ reason, courseId });
    });
  }
  deleteReasonOfReject(courseId: number, transaction?: Transaction) {
    return this.handleException.handle(async () => {
      return this.courseRejectModel.destroy({
        where: { courseId },
        transaction,
      });
    });
  }

  findAllPublishedCourses(page: number = 1, limit: number = 10) {
    return this.handleException.handle(async () => {
      return this.courseModel.findAll({
        where: { status: 'PUBLISHED' },
        offset: (page - 1) * limit,
        attributes: [
          'id',
          'title',
          'description',
          'thumbnail',
          'price',
          'category',
          'avgRating',
          [
            this.sequelize.fn('COUNT', this.sequelize.col('enrollments.id')),
            'num_of_students',
          ],
        ],
        include: [
          {
            model: Instructer,
            as: 'instructer',
            include: [
              {
                model: User,
                attributes: ['id', 'name'],
              },
            ],
          },
          {
            model: Enrollment,
            as: 'enrollments',
            attributes: [],
          },
        ],

        group: [
          'Course.title',
          'instructer.name',
          'Course.description',
          'Course.thumbnail',
          'Course.price',
          'Course.category',
          'Course.avgRating',
          'Course.numOfReviews',
          'Course.id',
          'instructer.id',
        ],
      });
    });
  }
  findAllPublishedCoursesToHome(limit: number = 10) {
    return this.handleException.handle(async () => {
      return this.courseModel.findAll({
        where: { status: 'PUBLISHED' },
        limit ,
        order : this.sequelize.random(),
        attributes: [
          'id',
          'title',
          'description',
          'thumbnail',
          'price',
          'category',
          'avgRating',
          [
            this.sequelize.fn('COUNT', this.sequelize.col('enrollments.id')),
            'num_of_students',
          ],
        ],
        include: [
          {
            model: Instructer,
            as: 'instructer',
            include: [
              {
                model: User,
                attributes: ['id', 'name'],
              },
            ],
          },
          {
            model: Enrollment,
            as: 'enrollments',
            attributes: [],
          },
        ],

        group: [
          'Course.title',
          'instructer.name',
          'Course.description',
          'Course.thumbnail',
          'Course.price',
          'Course.category',
          'Course.avgRating',
          'Course.numOfReviews',
          'Course.id',
          'instructer.id',
        ],
      });
    });
  }

  getCoursesByInstructer(
    instructerId: number,
    page: number = 1,
    limit: number = 4,
  ) {
    return this.handleException.handle(async () => {
      return this.courseModel.findAll({
        where: { instructerId },

        offset: (page - 1) * limit,
        limit,

        attributes: [
          'id',
          'title',
          'status',
          'thumbnail',
          'price',
          'category',
          [
            this.sequelize.fn('COUNT', this.sequelize.col('enrollments.id')),
            'num_of_students',
          ],
        ],

        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            attributes: [],
          },
        ],

        group: [
          'Course.id',
          'Course.title',
          'Course.status',
          'Course.thumbnail',
          'Course.price',
          'Course.category',
        ],
      });
    });
  }

  findCourseToDelete(courseId: number, instructerId: number) {
    return this.handleException.handle(async () => {
      return this.courseModel.findOne({
        where: { id: courseId, instructerId },
        attributes: ['id', 'status'],
      });
    });
  }

  softDeleteCourse(
    courseId: number,
    instructerId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.courseModel.destroy({
        where: { id: courseId, instructerId },
        transaction,
      });
    });
  }

  hardDeleteCourse(
    courseId: number,
    instructerId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.courseModel.destroy({
        where: { id: courseId, instructerId },
        force: true,
        transaction,
      });
    });
  }

  findCourseForReviewAndComments(courseId: number) {
    return this.handleException.handle(async () => {
      return this.courseModel.findByPk(courseId, {
        attributes: ['id', 'status'],
      });
    });
  }

  updateCourseDuration(
    courseId: number,
    duration: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.courseModel.update(
        { total_duration: duration },
        {
          where: { id: courseId },
          transaction,
        },
      );
    });
  }

  findCourseToLessonGuard(courseId: number, userId: number) {
    return this.handleException.handle(async () =>
      this.courseModel.findByPk(courseId, {
        attributes: ['id'],
        include: [
          {
            model: Enrollment,
            where: { userId },
            as: 'enrollments',
            attributes: ['id'],
            required: false,
          },
        ],
      }),
    );
  }

  findCourseToProgress(courseId: number, userId: number) {
    return this.handleException.handle(async () =>
      this.courseModel.findByPk(courseId, {
        attributes: ['id'],
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            attributes: ['id'],
            where: { userId },
            required: false,
          },
        ],
      }),
    );
  }

  findAllCoursesToInstructorDashboard(
    instructorId: number,
    page: number = 1,
    limit: number = 4,
  ) {
    return this.handleException.handle(async () => {
      return this.courseModel.findAll({
        where: {
          instructerId: instructorId,
        },
        offset: (page - 1) * limit,
        limit,

        attributes: [
          'id',
          'title',
          'status',
          'thumbnail',
          'price',
          'category',
          'avgRating',
          'createdAt',
          'updatedAt',
          'total_duration',

          [
            // get count of students enrolled in the instructor's courses by subQuery
            this.sequelize.literal(`(
              SELECT COUNT(*)
              FROM enrollments AS e
              WHERE e.courseId = Course.id
            )`),
            'num_of_students',
          ],

          [
            // get count of lessons in the instructor's courses by subQuery
            this.sequelize.literal(`(
              SELECT COUNT(*)
              FROM sections AS s
              JOIN lessons AS l ON s.id = l.sectionId
              WHERE s.courseId = Course.id
            )`),
            'num_of_lessons',
          ],
        ],
        raw: true,
      });
    });
  }

  countOfActiveCoursesByInstructor(instructorId: number) {
    return this.handleException.handle(async () => {
      return this.courseModel.count({
        where: { instructerId: instructorId, status: CourseStatus.PUBLISHED },
      });
    });
  }
}
