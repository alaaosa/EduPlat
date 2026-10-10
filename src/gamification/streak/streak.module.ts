import { Module } from '@nestjs/common';
import { StreakService } from './streak.service';
import { StreakController } from './streak.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Streak } from './entities/streak.entity';
import { StreakRepository } from './repo/streak.repo';
import { HandleException } from 'src/db/db.service';

@Module({
  controllers: [StreakController],
  imports: [SequelizeModule.forFeature([Streak])],
  providers: [StreakService, StreakRepository, HandleException],
  exports: [StreakService],
})
export class StreakModule {}
