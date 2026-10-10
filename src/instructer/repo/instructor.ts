import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { EnrollmentRepository } from 'src/course/enrollment/repo/enrollment.repo';
import { CourseRepository } from 'src/course/repo/course.repo';
import { HandleException } from 'src/db/db.service';
import { Instructer } from '../entities/instructer';
import { CreationAttributes, Sequelize } from 'sequelize';
import { Course } from 'src/course/entities/course.entity';
import { Enrollment } from 'src/course/enrollment/entities/enrollment.entity';
import { UserRepository } from 'src/user/repo/user';

@Injectable()
export class InstructerRepository {
  constructor(
    private readonly handleException: HandleException,
    @InjectModel(Instructer) private instructerModel: typeof Instructer,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  create(data: Omit<CreationAttributes<Instructer>, ''>) {
    return this.handleException.handle(async () =>
      this.instructerModel.create(data),
    );
  }

  createAccountId(instructerId: number, stripeAccountId: string) {
    return this.handleException.handle(async () =>
      this.instructerModel.update(
        { stripeAccountId },
        { where: { instructerId } },
      ),
    );
  }

  getInstructerDataDashboard(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findOne({
        where: { instructerId },
        attributes: [
          [
            // get the total of instructer earnings
            this.sequelize.literal(`(
              SELECT SUM(instructor_earnings) FROM payments WHERE payments.instructorId = instructers.instructerId
            )`),
            'totalEarnings',
          ],
        ],
      }),
    );
  }

  getInstructerStatesInDashboard(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findOne({
        where: {
          instructerId,
        },

        attributes: [
          'instructerId',

          [
            this.sequelize.literal(`(

            SELECT COALESCE(COUNT(*), 0)

            FROM courses AS c

            WHERE c.instructerId = instructers.instructerId

          )`),

            'coursesCount',
          ],

          [
            this.sequelize.literal(`(

            SELECT

              COALESCE(

                SUM(sumRating * numOfReviews)

                / NULLIF(SUM(numOfReviews), 0),

                0

              )

            FROM courses

            WHERE courses.instructerId = instructers.instructerId

          )`),

            'avgInstructorRating',
          ],

          [
            this.sequelize.literal(`(

            SELECT COALESCE(COUNT(*), 0)

            FROM enrollments AS e

            INNER JOIN courses AS c

              ON c.id = e.courseId

            WHERE c.instructerId = instructers.instructerId

          )`),

            'studentsCount',
          ],

          [
            this.sequelize.literal(`(

            SELECT COALESCE(SUM(p.amount), 0)

            FROM payments AS p

            WHERE p.instructerId = instructers.instructerId

          )`),

            'totalPayments',
          ],

          [
            this.sequelize.literal(`(

            SELECT COALESCE(

              (

                SELECT

                  YEAR(p.createdAt) AS year,

                  DATENAME(MONTH, p.createdAt) AS month,

                  SUM(p.instructor_earnings) AS instructor_earnings

                FROM payments AS p

                WHERE p.instructorId = instructers.instructerId

                GROUP BY

                  YEAR(p.createdAt),

                  MONTH(p.createdAt)

                ORDER BY

                  YEAR(p.createdAt),

                  MONTH(p.createdAt)

                FOR JSON PATH

              ),

              '[]'

            )

          )`),

            'monthlyEarnings',
          ],
        ],

        raw: true,
      }),
    );
  }
  // getInstructerStates(instructerId: number) {
  //   return this.handleException.handle(async () =>
  //     this.instructerModel.findOne({
  //       where: {
  //         instructerId,
  //       },
  //       attributes: [
  //         'id',
  //         [
  //           this.sequelize.fn(
  //             'COUNT',
  //             this.sequelize.fn('DISTINCT', this.sequelize.col('courses.id')),
  //           ),
  //           'coursesCount',
  //         ],
  //         [
  //           this.sequelize.fn(
  //             'COUNT',
  //             this.sequelize.col('courses->enrollments.id'),
  //           ),
  //           'studentsCount',
  //         ],
  //       ],
  //       include: [
  //         {
  //           model: Course,
  //           as: 'courses',
  //           attributes: [],
  //           required: false,
  //           include: [
  //             {
  //               model: Enrollment,
  //               as: 'enrollments',
  //               attributes: [],
  //               required: false,
  //             },
  //           ],
  //         },
  //       ],
  //       group: ['Instructer.id'],
  //       raw: true,
  //     }),
  //   );
  // }

  getAccountIdByInstructerId(instructerId: number) {
    return this.handleException.handle(
      async () =>
        await this.instructerModel.findByPk(instructerId, {
          attributes: ['stripeAccountId'],
        }),
    );
  }

  // find all courses of instructer by instructerId
  findAllCoursesByInstructerId(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findByPk(instructerId, {
        attributes: [
          [
            this.sequelize.literal(`(
            SELECT COUNT(*)
            FROM courses AS c
            WHERE c.instructerId = instructers.instructerId
          )`),
            'num_of_courses',
          ],
        ],
      }),
    );
  }

  getInstructerStatesAnalytics(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findOne({
        where: {
          instructerId,
        },

        attributes: [
          'instructerId',

          [
            this.sequelize.literal(`(

            SELECT COALESCE(COUNT(*), 0)

            FROM courses AS c

            WHERE c.instructerId = instructers.instructerId

          )`),

            'coursesCount',
          ],

          [
            this.sequelize.literal(`(

            SELECT

              COALESCE(

                SUM(sumRating * numOfReviews)

                / NULLIF(SUM(numOfReviews), 0),

                0

              )

            FROM courses

            WHERE courses.instructerId = instructers.instructerId

          )`),

            'avgInstructorRating',
          ],

          [
            this.sequelize.literal(`(

            SELECT COALESCE(COUNT(*), 0)

            FROM enrollments AS e

            INNER JOIN courses AS c

              ON c.id = e.courseId

            WHERE c.instructerId = instructers.instructerId

          )`),

            'studentsCount',
          ],

          [
            this.sequelize.literal(`(

            SELECT COALESCE(SUM(p.amount), 0)

            FROM payments AS p

            WHERE p.instructerId = instructers.instructerId

          )`),

            'totalPayments',
          ],

          [
            this.sequelize.literal(`(

            SELECT COALESCE(

              (

                SELECT

                  YEAR(p.createdAt) AS year,

                  DATENAME(MONTH, p.createdAt) AS month,

                  SUM(p.instructor_earnings) AS instructor_earnings

                FROM payments AS p

                WHERE p.instructorId = instructers.instructerId

                GROUP BY

                  YEAR(p.createdAt),
                  MONTH(p.createdAt)

                ORDER BY

                  YEAR(p.createdAt),
                  MONTH(p.createdAt)

                FOR JSON PATH

              ),

              '[]'

            )

          )`),

            'monthlyEarnings',
          ],
          [
            // get each course's instructor name, the total earnings
            // and the total number of students enrolled in each course
            this.sequelize.literal(`(
    SELECT COALESCE(
      (
        SELECT
          c.id AS courseId,
          c.title AS courseTitle,

          COALESCE(
            (
              SELECT SUM(p.instructor_earnings)
              FROM payments AS p
              WHERE p.itemId = c.id
                AND p.type = 'course'
            ),
            0
          ) AS totalEarnings,

          (
            SELECT COUNT(*)
            FROM enrollments AS e
            WHERE e.courseId = c.id
          ) AS totalStudents

        FROM courses AS c

        WHERE c.instructerId = instructers.instructerId

        FOR JSON PATH
      ),
      '[]'
    )
  )`),
            'coursesAnalytics',
          ],
        ],

        raw: true,
      }),
    );
  }

  getRevenueByInstructerId(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findByPk(instructerId, {
        attributes: [
          [
            this.sequelize.literal(`(
            SELECT COALESCE(SUM(p.instructor_earnings), 0)
            FROM payments AS p
            WHERE p.instructerId = instructers.instructorId
          )`),
            'totalEarnings',
          ][
            (this.sequelize.literal(`(
            SELECT COALESCE(SUM(p.instructor_earnings), 0)
            FROM payments AS p
            WHERE p.instructerId = instructers.instructorId
              AND YEAR(p.createdAt) = YEAR(GETDATE())
              AND MONTH(p.createdAt) = MONTH(GETDATE())
          )`),
            'monthlyEarnings')
          ],
          [
            this.sequelize.literal(`(

            SELECT COALESCE(

              (

                SELECT

                  YEAR(p.createdAt) AS year,

                  DATENAME(MONTH, p.createdAt) AS month,

                  SUM(p.instructor_earnings) AS instructor_earnings

                FROM payments AS p

                WHERE p.instructorId = instructers.instructerId

                GROUP BY

                  YEAR(p.createdAt),
                  MONTH(p.createdAt)

                ORDER BY

                  YEAR(p.createdAt),
                  MONTH(p.createdAt)

                FOR JSON PATH

              ),

              '[]'

            )

          )`),

            'monthlyEarnings',
          ],
          [
            this.sequelize.literal(`(
    SELECT COALESCE(
      (
        SELECT TOP 5
          p.id AS paymentId,
          p.userId AS userId,
          u.name AS userName,
          p.itemId AS courseId,
          c.title AS courseTitle,
          p.amount AS totalAmount,
          p.createdAt AS transactionDate

        FROM payments AS p

        INNER JOIN users AS u
          ON p.userId = u.id

        INNER JOIN courses AS c
          ON p.itemId = c.id

        WHERE p.instructorId = instructers.instructerId
          AND p.type = 'course'

        ORDER BY p.createdAt DESC

        FOR JSON PATH
      ),
      '[]'
    )
  )`),
            'recentTransactions',
          ],
        ],
      }),
    );
  }

  getReviewsByInstructerId(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findByPk(instructerId, {
        attributes: [
          [
            // get all reviews of the instructer's courses
            this.sequelize.literal(`(
                  SELECT COALESCE(
                    (
                      SELECT
                        u.name AS userName,
                        r.rating AS rating,
                        r.comment AS comment
                      FROM reviews AS r
                      INNER JOIN users AS u
                        ON r.userId = u.id
                      WHERE r.courseId IN (
                        SELECT id
                        FROM courses
                        WHERE instructorId = instructers.instructorId
                      )
                      FOR JSON PATH
                    ),
                    '[]'
                  )
                )`),
            'reviews',
          ],
          [
            this.sequelize.literal(`(

            SELECT

              COALESCE(

                SUM(sumRating * numOfReviews)

                / NULLIF(SUM(numOfReviews), 0),
                0
              )
            FROM courses
            WHERE courses.instructerId = instructers.instructerId
          )`),
            'avgInstructorRating',
          ],
          [
            this.sequelize.literal(`(
            SELECT
              COALESCE(SUM(numOfReviews),0)
            FROM courses
            WHERE courses.instructerId = instructers.instructerId
          )`),
            'totalReviews',
          ],
        ],
      }),
    );
  }

  getProfileDataByInstructerId(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findByPk(instructerId, {
        attributes: [
          [
            this.sequelize.literal(`(
            SELECT u.name , u.email , u.profileImage , u.bio
            FROM users AS u
            WHERE u.id = instructers.instructerId
          )`),
            'userData',
          ],
        ],
      }),
    );
  }

  getNotificationSettingsByInstructerId(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findByPk(instructerId, {
        attributes: [
          [
            this.sequelize.literal(`(
            SELECT us.emailNotifications, us.pushNotifications
            FROM user_settings AS us
            WHERE ns.userId = instructers.instructerId
          )`),
            'notificationSettings',
          ],
        ],
      }),
    );
  }

  getCurrentPasswordByInstructerId(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findByPk(instructerId, {
        attributes: [
          [
            this.sequelize.literal(`(
            SELECT u.password
            FROM users AS u
            WHERE u.id = instructers.instructerId
          )`),
            'currentPassword',
          ],
        ],
      }),
    );
  }

  getSecurtiyDetailsByInstructerId(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findByPk(instructerId, {
        attributes: [
          [
            this.sequelize.literal(`(
            SELECT us.twoFactorAuthentication
            FROM user_settings AS us
            WHERE us.userId = instructers.instructerId
          )`),
            'twoFactorAuthentication',
          ],
        ],
      }),
    );
  }

  getStripeAccountIdByInstructerId(instructerId: number) {
    return this.handleException.handle(async () =>
      this.instructerModel.findByPk(instructerId, {
        attributes: ['stripeAccountId'],
      }),
    );
  }

  becomeInstructer(
    data: Omit<CreationAttributes<Instructer>, 'instructerId'>,
    instructerId: number,
  ) {
    return this.handleException.handle(async () =>
      this.instructerModel.create({ ...data, instructerId }),
    );
  }
}
