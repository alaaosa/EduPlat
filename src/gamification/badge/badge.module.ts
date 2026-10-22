import { Module } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/badge.user';
import { BadgeRepository } from './repo/badge.repo';
import { BadgeEventListener } from './listener';
import { BadgeWorker } from './badge.worker';
import { HandleException } from 'src/db/db.service';

@Module({
  imports: [SequelizeModule.forFeature([Badge, UserBadge])],
  controllers: [BadgeController],
  providers: [BadgeService, BadgeRepository, BadgeEventListener, BadgeWorker, HandleException],
})
export class BadgeModule {}
