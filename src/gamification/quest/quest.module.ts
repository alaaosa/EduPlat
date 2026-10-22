import { Module } from '@nestjs/common';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Quest } from './entities/quest.entity';
import { UserQuest } from './entities/user.quest';
import { QuestRepository } from './repo/quest.repo';
import { QuestEventListener } from './quest.listener';
import { QuestWorker } from './quest.worker';
import { HandleException } from 'src/db/db.service';

@Module({
  imports: [SequelizeModule.forFeature([Quest, UserQuest])],
  controllers: [QuestController],
  providers: [QuestService, QuestRepository, QuestEventListener, QuestWorker, HandleException],
})
export class QuestModule {}
