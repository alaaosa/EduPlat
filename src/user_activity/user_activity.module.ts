import { Module } from '@nestjs/common';
import { UserActivityService } from './user_activity.service';
import { UserActivityController } from './user_activity.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Course } from 'src/learning/course/infrastructure/persistence/models/course.entity';
import { Badge } from 'src/gamification/badge/entities/badge.entity';
import { UserBadge } from 'src/gamification/badge/entities/badge.user';
import { Quest } from 'src/gamification/quest/entities/quest.entity';
import { UserQuest } from 'src/gamification/quest/entities/user.quest';
import { Reward } from 'src/gamification/reward/entities/reward.entity';
import { RewardUser } from 'src/gamification/reward/entities/reward.user';
import { UserActivityRepository } from './repo/user_activity.repo';
import { HandleException } from 'src/db/db.service';
import { GroupModule } from 'src/community/group/group.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Enrollment,
      Course,
      Badge,
      UserBadge,
      Quest,
      UserQuest,
      Reward,
      RewardUser,
    ]),
    GroupModule,
  ],
  controllers: [UserActivityController],
  providers: [UserActivityService, UserActivityRepository, HandleException],
})
export class UserActivityModule {}
