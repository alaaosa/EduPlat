import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { QueryTypes, Sequelize } from 'sequelize';
import { HandleException } from 'src/db/db.service';

@Injectable()
export class AdminRepository {
  constructor(
    private readonly exceptionHandler: HandleException,
    @InjectConnection() private readonly sequlize: Sequelize,
  ) {}

  getAdminDahboardOverview() {
    return this.exceptionHandler.handle(async () => {
      const [result] = await this.sequlize.query<{
        total_users: number;
        total_instructers: number;
        total_students: number;
        total_admins: number;
        total_courses: number;
        total_earnings: number;
        count_instructers_requestes: number;
      }>(
        `
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'instructor') AS total_instructers,
            (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_students,
            (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
            (SELECT COUNT(*) FROM courses WHERE status = 'active') AS total_courses,
            (SELECT COALESCE(SUM(platform_fee), 0) 
            FROM payments) AS total_earnings,
            (SELECT COUNT(*) FROM instructers WHERE isInstructer = TRUE) AS count_instructers_requestes,
        `,
        {
          type: QueryTypes.SELECT,
        },
      );
      result.total_earnings = result.total_earnings / 100; // convert from cents to dollars
      return result;
    });
  }

  getMonthlyEarnings() {
    return this.exceptionHandler.handle(async () => {
      const [result] = await this.sequlize.query<
        {
          year: number;
          month: number;
          earnings: number;
        }[]
      >(
        `
            (SELECT
                YEAR(p.createdAt) AS year,
                MONTH(p.createdAt) AS month,
                COALESCE(SUM(platform_fee), 0) AS earnings
            FROM payments p
            GROUP BY
                YEAR(p.createdAt),
                MONTH(p.createdAt)
            ORDER BY
                YEAR(p.createdAt),
                MONTH(p.createdAt)
            FOR JSON PATH
            ) AS monthly_earnings;

        `,
        {
          type: QueryTypes.SELECT,
        },
      );
      result.forEach(({ earnings }) => (earnings = earnings / 100)); // convert from cents to dollars

      return result;
    });
  }

  monthlyStatistics() {
    return this.exceptionHandler.handle(async () => {
      const [result] = await this.sequlize.query<
        {
          year: number;
          month: number;
          users_count: number;
          courses_count: number;
        }[]
      >(
        `
       (
            SELECT
                COALESCE(u.year, c.year) AS year,
                COALESCE(u.month, c.month) AS month,
                COALESCE(u.users_count, 0) AS users_count,
                COALESCE(c.courses_count, 0) AS courses_count
            FROM (
                SELECT
                    YEAR(createdAt) AS year,
                    MONTH(createdAt) AS month,
                    COUNT(*) AS users_count
                FROM users
                GROUP BY YEAR(createdAt), MONTH(createdAt)
            ) u
            FULL OUTER JOIN (
                SELECT
                    YEAR(createdAt) AS year,
                    MONTH(createdAt) AS month,
                    COUNT(*) AS courses_count
                FROM courses
                GROUP BY YEAR(createdAt), MONTH(createdAt)
            ) c
                ON u.year = c.year
                AND u.month = c.month
            ORDER BY year, month
            FOR JSON PATH
        ) AS monthly_statistics
    `,
        {
          type: QueryTypes.SELECT,
        },
      );

      return result;
    });
  }

  getCoursesStatisticsBasedCategory() {
    return this.exceptionHandler.handle(async () => {
      const [result] = await this.sequlize.query<
        { category: string; courses_count: number }[]
      >(
        `
        SELECT
           ( c.category AS category,
            COUNT(*) AS courses_count
        FROM courses c
        GROUP BY c.category
        ORDER BY courses_count DESC
        FOR JSON PATH) as courses_statistics_by_category
        `,
        {
          type: QueryTypes.SELECT,
        },
      );
      return result;
    });
  }

  getPendingCourses(): Promise<{ pending_courses: any[] }> {
    return this.exceptionHandler.handle(async () => {
      const [result] = await this.sequlize.query(
        `
            SELECT
                (SELECT COUNT(*)
                 FROM courses
                 WHERE status = 'pending') AS pending_courses_count,

                (
                    SELECT TOP 3
                        c.id AS course_id,
                        c.title AS course_title,
                        c.createdAt,
                        u.id AS instructor_id,
                        u.name,
                        
                    FROM courses AS c
                    INNER JOIN instructers AS i
                        ON i.instructerId = c.instructerId
                    INNER JOIN users AS u
                        ON u.id = i.instructerId
                    WHERE c.status = 'pending'
                    ORDER BY c.createdAt DESC
                    FOR JSON PATH
                ) AS pending_courses;
            `,
        {
          type: QueryTypes.SELECT,
        },
      );
      return JSON.parse(result['pending_courses']);
    });
  }

  async getLastRegisteredUsers(): Promise<{
    last_registered_users: {
      user_id: string;
      user_name: string;
      user_email: string;
      registration_date: Date;
      user_role: string;
      is_activate: string;
    }[];
  }> {
    return this.exceptionHandler.handle(async () => {
      const [users] = await this.sequlize.query<
        {
          user_id: string;
          user_name: string;
          user_email: string;
          registration_date: Date;
          user_role: string;
          is_activated: boolean;
        }[]
      >(
        `
      SELECT TOP 5
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.createdAt AS registration_date,
        u.role AS user_role,
        u.isActivited AS is_activated
      FROM users AS u
      FOR JSON PATH
      ORDER BY u.createdAt DESC
      `,
        {
          type: QueryTypes.SELECT,
        },
      );

      return {
        last_registered_users: users.map(({ is_activated, ...user }) => ({
          ...user,
          is_activate: is_activated ? 'active' : 'inactive',
        })),
      };
    });
  }
}
