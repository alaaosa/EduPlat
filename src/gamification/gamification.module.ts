import { Module } from '@nestjs/common';
import { BadgeModule } from './badge/badge.module';
import { RewardModule } from './reward/reward.module';
import { QuestModule } from './quest/quest.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { StreakModule } from './streak/streak.module';

@Module({
  imports: [RewardModule, BadgeModule, QuestModule, LeaderboardModule, StreakModule],
})
export class GamificationModule {}
