import { Injectable } from '@nestjs/common';
import { LeaderboardService } from 'src/gamification/leaderboard/leaderboard.service';
import { StreakService } from 'src/gamification/streak/streak.service';
import { EnrollmentRepository } from 'src/course/enrollment/repo/enrollment.repo';

export interface StudentDashboardResult {
  courseStats: { total: number; completed: number; inProgress: number };
  enrolledCourses: Array<{
    id: number;
    title: string | null;
    thumbnail: string | null;
    instructor: { name: string } | null;
    progress: { percentage: number; completed: boolean } | null;
  }>;
  leaderboard: { rank: number | null };
  streak: { current: number | null };
}

@Injectable()
export class StudentDashboardService {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly leaderboardService: LeaderboardService,
    private readonly streakService: StreakService,
  ) {}

  async getDashboard(userId: number): Promise<StudentDashboardResult> {
    const [courseDashboard, leaderboardRank, currentStreak] = await Promise.all([
      this.enrollmentRepository.getDashboardCourseStats(userId),
      this.leaderboardService.getRankOfUser(userId),
      this.streakService.getCurrentStreak(userId),
    ]);

    return {
      courseStats: {
        total: courseDashboard.total,
        completed: courseDashboard.completed, 
        inProgress: courseDashboard.inProgress,
      },
      enrolledCourses: courseDashboard.enrolledCourses.map((course) => ({
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        progress: course.progress
          ? {
              percentage: course.progress.progressPercentage,
              completed: course.progress.completed,
            }
          : null,
      })),
      leaderboard: { rank: leaderboardRank.position },
      streak: { current: currentStreak },
    };
  }
}
