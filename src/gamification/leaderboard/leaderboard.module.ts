import { forwardRef, Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Leaderboard } from './entities/leaderboard.entity';
import { LeaderboardRepository } from './repo/leaderboard.repo';
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
