import { forwardRef, Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repo/user';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserSetting } from './entities/user.setting';
import { User } from './entities/user.entity';
import { OTP } from './entities/otp.entity';
import { OTPRepository } from './repo/otp';
import { HandleException } from 'src/db/db.service';
import { UserState } from './entities/user.states';
import { CourseProgressModule } from 'src/course/progress/course-progress.module';
import { LeaderboardModule } from 'src/gamification/leaderboard/leaderboard.module';
import { StreakModule } from 'src/gamification/streak/streak.module';
import { DashboardResolver } from './dashboard.resolver';
import { StudentDashboardService } from './dashboard.service';
@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([UserSetting, User, OTP, UserState]),
    CourseProgressModule,
    forwardRef(() => LeaderboardModule),
    StreakModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    OTPRepository,
    HandleException,
    DashboardResolver,
    StudentDashboardService,
  ],
  exports: [UserService, UserRepository, OTPRepository , HandleException],
})
export class UserModule {}
