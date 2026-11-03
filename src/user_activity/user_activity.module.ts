import { Module } from '@nestjs/common';
import { UserActivityService } from './user_activity.service';
import { UserActivityController } from './user_activity.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Course } from 'src/learning/course/infrastructure/persistence/models/course.entity';
import { Badge } from 'src/gamification2/infrastructure/models/badge/badge';
import { UserBadge } from 'src/gamification2/infrastructure/models/badge/badge.user';
import { Quest } from 'src/gamification2/infrastructure/models/quest/quest';
import { UserQuest } from 'src/gamification2/infrastructure/models/quest/user.quest';
import { Reward } from 'src/gamification2/infrastructure/models/reward/reward';
import { RewardUser } from 'src/gamification2/infrastructure/models/reward/reward.user';
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
