import { Module } from '@nestjs/common';
import { StreakService } from '../../gamification2/application/streak.service';
import { StreakController } from './streak.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Streak } from '../../gamification2/infrastructure/models/streak/streak';
import { StreakRepository } from '../../gamification2/infrastructure/repo/streak.repo';
import { HandleException } from 'src/db/db.service';
import { StreakGateway } from '../../gamification2/presentation/ws/streak-wbsocket';

@Module({
  controllers: [StreakController],
  imports: [SequelizeModule.forFeature([Streak])],
  providers: [StreakService, StreakRepository, StreakGateway, HandleException],
  exports: [StreakService],
})
export class StreakModule {}
