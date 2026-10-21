import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HandleException } from 'src/db/db.service';
import { Course } from 'src/learning/course/infrastructure/persistence/models/course.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Badge } from 'src/gamification/badge/entities/badge.entity';
import { UserBadge } from 'src/gamification/badge/entities/badge.user';
import { Quest } from 'src/gamification/quest/entities/quest.entity';
import { UserQuest } from 'src/gamification/quest/entities/user.quest';
import { Reward } from 'src/gamification/reward/entities/reward.entity';
import { RewardUser } from 'src/gamification/reward/entities/reward.user';

export interface UserActivityData {
  courses: { title: string }[];
  badges: { title: string }[];
  quests: { title: string }[];
  rewards: { title: string }[];
}

@Injectable()
export class UserActivityRepository {
  constructor(
    private readonly exceptionHandler: HandleException,
    @InjectModel(Enrollment)
    private readonly enrollmentModel: typeof Enrollment,
    @InjectModel(UserBadge) private readonly userBadgeModel: typeof UserBadge,
    @InjectModel(UserQuest) private readonly userQuestModel: typeof UserQuest,
    @InjectModel(RewardUser)
    private readonly rewardUserModel: typeof RewardUser,
    @InjectModel(Reward) private readonly rewardModel: typeof Reward,
  ) {}

  findByUserId(userId: number): Promise<UserActivityData> {
    return this.exceptionHandler.handle(async () => {
      const [enrollments, userBadges, userQuests, userRewards] =
        await Promise.all([
          this.enrollmentModel.findAll({
            where: { userId },
            attributes: ['courseId'],
            include: [
              {
                model: Course,
                as: 'course',
                attributes: ['title'],
                required: true,
              },
            ],
          }),
          this.userBadgeModel.findAll({
            where: { userId },
            attributes: ['badgeId'],
            include: [
              {
                model: Badge,
                as: 'badge',
                attributes: ['name'],
                required: true,
              },
            ],
          }),
          this.userQuestModel.findAll({
            where: { userId },
            attributes: ['questId'],
            include: [
              {
                model: Quest,
                as: 'quest',
                attributes: ['name'],
                required: true,
              },
            ],
          }),
          this.rewardUserModel.findAll({
            where: { userId },
            attributes: ['rewardId'],
          }),
        ]);

      const rewardIds = userRewards.map(({ rewardId }) => rewardId);
      const rewards = rewardIds.length
        ? await this.rewardModel.findAll({
            where: { id: rewardIds },
            attributes: ['title'],
          })
        : [];

      return {
        courses: enrollments
          .filter((enrollment) => enrollment.course)
          .map(({ course }) => ({ title: course.title })),
        badges: userBadges
          .filter((userBadge) => userBadge.badge)
          .map(({ badge }) => ({ title: badge.name })),
        quests: userQuests
          .filter((userQuest) => userQuest.quest)
          .map(({ quest }) => ({ title: quest.name })),
        rewards: rewards.map(({ title }) => ({ title })),
      };
    });
  }
}
