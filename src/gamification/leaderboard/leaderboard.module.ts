import { forwardRef, Module } from '@nestjs/common';
import { LeaderboardService } from '../../gamification2/application/leaderboard.service';
import { LeaderboardController } from '../../gamification2/presentation/controllers/leaderboard.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Leaderboard } from '../../gamification2/infrastructure/models/leaderboard/leaderboard';
import { LeaderboardRepository } from '../../gamification2/infrastructure/repo/leaderboard.repo';
import { HandleException } from 'src/db/db.service';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [LeaderboardController],
  imports: [
    SequelizeModule.forFeature([Leaderboard]),
    forwardRef(() => UserModule),
  ],
  providers: [LeaderboardService, LeaderboardRepository, HandleException],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
