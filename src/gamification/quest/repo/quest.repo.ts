import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Quest } from '../entities/quest.entity';
import { UserQuest } from '../entities/user.quest';
import { QuestEventNames } from 'src/gamification/shared/enum/quest.enum';
import { HandleException } from 'src/db/db.service';
import { Sequelize } from 'sequelize';
import { NotFoundError } from '@mux/mux-node';

@Injectable()
export class QuestRepository {
  constructor(
    private readonly exceptionHandler: HandleException,
    @InjectModel(Quest) private readonly questModel: typeof Quest,
    @InjectModel(UserQuest) private readonly userQuestModel: typeof UserQuest,
    @InjectConnection() private sequlize: Sequelize,
  ) {}

  findQuests(eventType: QuestEventNames) {
    return this.exceptionHandler.handle(async () =>
      this.questModel.findAll({ where: { eventType }, attributes: ['id'] }),
    );
  }

  async incrementUserQuestProgress(userId: number, questId: number) {
    return this.exceptionHandler.handle(async () =>
      this.sequlize.transaction(async (transaction) => {
        const userQuest = await this.userQuestModel.findOne({
          where: {
            userId,
            questId,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        const quest = await this.questModel.findByPk(questId, { transaction });
        if (!quest) throw new NotFoundException('quest not found');

        if (!userQuest) {
          return this.userQuestModel.create(
            {
              userId,
              questId,
              progress: 1,
              lock: 1 < quest.num_to_unlock,
            },
            { transaction },
          );
        }

        if (userQuest.lock === false) {
          return userQuest;
        }

        const newProgress = userQuest.progress + 1;

        await userQuest.update({
          progress: newProgress,
          lock: newProgress >= quest.num_to_unlock ? false : userQuest.lock,
        });

        return userQuest;
      }),
    );
  }
}
