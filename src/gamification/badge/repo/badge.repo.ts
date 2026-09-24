import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Badge } from '../entities/badge.entity';
import { CreationAttributes, Sequelize } from 'sequelize';
import { HandleException } from 'src/db/db.service';
import { BadgeEventType } from 'src/gamification/shared/enum/badge.enums';
import { UserBadge } from '../entities/badge.user';

@Injectable()
export class BadgeRepository {
  constructor(
    private readonly handlerException: HandleException,
    @InjectModel(Badge) private readonly badgeModel: typeof Badge,
    @InjectModel(UserBadge) private readonly badgeUserModel: typeof UserBadge,
    @InjectConnection() private sequelize: Sequelize,
  ) {}

  // create(data : Omit<CreationAttributes<Badge>,''>){
  //     return this.handlerException.handle(async()=>this.badgeModel.)

  // }

  findAllBasedOnEventType(eventType: BadgeEventType, userId: number) {
    return this.handlerException.handle(async () =>
      this.badgeModel.findAll({
        where: { eventType },
        attributes: ['id'],
        // include: [
        //   {
        //     model: UserBadge,
        //     as: 'userBadges',
        //     where: { userId },
        //     required: false,
        //   },
        // ],
      }),
    );
  }

  async incrementUserBadgeProgress(userId: number, badgeId: number) {
    return this.sequelize.transaction(async (transaction) => {
      const userBadge = await this.badgeUserModel.findOne({
        where: {
          userId,
          badgeId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const badge = await this.badgeModel.findByPk(badgeId, {
        transaction,
      });

      if (!badge) {
        throw new Error('Badge not found');
      }

      if (!userBadge) {
        return this.badgeUserModel.create(
          {
            userId,
            badgeId,
            progress: 1,
            lock: 1 < badge.targetNumToUnlock,
          },
          { transaction },
        );
      }

      if (userBadge.lock === false) {
        return userBadge;
      }

      const newProgress = userBadge.progress + 1;

      await userBadge.update(
        {
          progress: newProgress,
          lock: newProgress >= badge.targetNumToUnlock ? false : userBadge.lock,
        },
        { transaction },
      );

      return userBadge;
    });
  }
}
