import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Badge } from '../../gamification2/infrastructure/models/badge/badge';
import { UserBadge } from '../../gamification2/infrastructure/models/badge/badge.user';
import { BadgeRepository } from '../../gamification2/infrastructure/repo/badge.repo';
import { BadgeEventListener } from './listener';
import { BadgeWorker } from '../../gamification2/infrastructure/jobs/workers/badge.worker';
import { HandleException } from 'src/db/db.service';

@Module({
  imports: [SequelizeModule.forFeature([Badge, UserBadge])],
  controllers: [BadgeController],
  providers: [
    BadgeService,
    BadgeRepository,
    BadgeEventListener,
    BadgeWorker,
    HandleException,
  ],
})
export class BadgeModule {}
