import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Badge } from '../models/badge/badge';
import { Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
import { HandleException } from 'src/db/db.service';
import { BadgeEventType } from 'src/gamification/domain/shared/enum/badge.enums';
import { UserBadge } from '../models/badge/badge.user';
import { BadgeEntity } from 'src/gamification/domain/entity/badge';
import { GamificationEventReceipt } from '../models/badge/gamification-event-receipt';

@Injectable()
export class BadgeRepository {
  constructor(
    private readonly handlerException: HandleException,
    @InjectModel(Badge) private readonly badgeModel: typeof Badge,
    @InjectModel(UserBadge) private readonly badgeUserModel: typeof UserBadge,
    @InjectConnection() private sequelize: Sequelize,
    @InjectModel(GamificationEventReceipt)
    private readonly gamificationEventReceipt: typeof GamificationEventReceipt,
  ) {}

  // create(data : Omit<CreationAttributes<Badge>,''>){
  //     return this.handlerException.handle(async()=>this.badgeModel.)

  // }

  findAllBasedOnEventType(
    eventType: BadgeEventType,
    userId: number,
    transaction?: Transaction,
  ) {
    return this.handlerException.handle(async () => {
      const badges = (await this.badgeModel.findAll({
        where: {
          eventType,
          [Op.or]: [
            Sequelize.where(Sequelize.col('userBadges.userId'), Op.is, null),
            Sequelize.where(Sequelize.col('userBadges.lock'), Op.eq, true),
          ],
        },
        attributes: ['id', 'targetNumToUnlock'],
        include: [
          {
            model: UserBadge,
            as: 'userBadges',
            where: { userId },
            required: false,
            attributes: ['progress', 'badgeId', 'lock', 'userId'],
          },
        ],
        raw: true,
        nest: false,
        transaction,
      })) as unknown as {
        id: number;
        targetNumToUnlock: number;
        'userBadges.progress': number | null;
        'userBadges.badgeId': number | null;
        'userBadges.lock': boolean | null;
        'userBadges.userId': number | null;
      }[];

      if (!badges || badges.length === 0) {
        return;
      }

      return new BadgeEntity(badges);
    });
  }

  bulkCreateUserBadges(
    userBadges: {
      userId: number;
      progress: number;
      lock: boolean;
      badgeId: number;
    }[],
    transaction?: Transaction,
  ) {
    return this.handlerException.handle(async () => {
      if (!userBadges.length) return;
      await this.badgeUserModel.bulkCreate(userBadges, { transaction });
    });
  }

  bulkUpdateUserBadges(
    userBadges: {
      userId: number;
      progress: number;
      lock: boolean;
      badgeId: number;
    }[],
    transaction?: Transaction,
  ) {
    return this.handlerException.handle(async () => {
      if (!userBadges.length) return;

      const tableName = this.badgeUserModel.getTableName();
      const table =
        typeof tableName === 'string'
          ? `[${tableName}]`
          : `[${tableName.schema}].[${tableName.tableName}]`;

      await this.sequelize.query(
        `
      UPDATE bu
      SET bu.progress = j.progress,
          bu.[lock]   = j.[lock]
      FROM ${table} AS bu
      INNER JOIN OPENJSON(:json)
        WITH (
          userId   INT '$.userId',
          badgeId  INT '$.badgeId',
          progress INT '$.progress',
          [lock]   BIT '$.lock'
        ) AS j
        ON bu.userId = j.userId AND bu.badgeId = j.badgeId
      `,
        {
          replacements: { json: JSON.stringify(userBadges) },
          type: QueryTypes.UPDATE,
          transaction,
        },
      );
    });
  }

  async processBadgeEvent(
    userId: number,
    eventType: BadgeEventType,
    idempotencyKey: string,
  ): Promise<void> {
    await this.sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
      async (transaction) => {
        // Serialize all badge events for this user, including the no-row-yet
        // case where row locks alone cannot protect the insert.
        const lockRows = (await this.sequelize.query<{ result: number }>(
          `DECLARE @lockResult INT;
           EXEC @lockResult = sp_getapplock
             @Resource = :resource,
             @LockMode = 'Exclusive',
             @LockOwner = 'Transaction',
             @LockTimeout = 10000;
           SELECT @lockResult AS result;`,
          {
            replacements: { resource: `gamification-user-${userId}` },
            type: QueryTypes.SELECT,
            transaction,
          },
        )) as { result: number }[];

        if (!lockRows.length || lockRows[0].result < 0) {
          throw new Error(
            `Could not acquire badge processing lock for user ${userId}`,
          );
        }

        const receipt = await this.gamificationEventReceipt.findByPk(
          idempotencyKey,
          { transaction },
        );
        if (receipt) return;

        const badgeEntity = await this.findAllBasedOnEventType(
          eventType,
          userId,
          transaction,
        );
        const badges = badgeEntity?.applyBadgeLogic(userId);

        if (badges) {
          await this.bulkCreateUserBadges(badges.newBadges, transaction);
          await this.bulkUpdateUserBadges(badges.hasBadges, transaction);
        }

        // Receipt and badge mutations commit or roll back as one unit.
        await this.gamificationEventReceipt.create(
          { userId, eventType, idempotency_key: idempotencyKey },
          { transaction },
        );
      },
    );
  }
  //   bulkUpdateUserBadges(
  //     userBadges: {
  //       userId: number;
  //       progress: number;
  //       lock: boolean;
  //       badgeId: number;
  //     }[],
  //   ) {
  //     return this.handlerException.handle(async () => {
  //       await this.badgeUserModel.update({progress : })
  //   })
  // }
  //   async incrementUserBadgeProgress(userId: number, badgeId: number) {
  //     return this.sequelize.transaction(async (transaction) => {
  //       const userBadge = await this.badgeUserModel.findOne({
  //         where: {
  //           userId,
  //           badgeId,
  //         },
  //         transaction,
  //         lock: transaction.LOCK.UPDATE,
  //       });

  //       const badge = await this.badgeModel.findByPk(badgeId, {
  //         transaction,
  //       });

  //       if (!badge) {
  //         throw new Error('Badge not found');
  //       }

  //       if (!userBadge) {
  //         return this.badgeUserModel.create(
  //           {
  //             userId,
  //             badgeId,
  //             progress: 1,
  //             lock: 1 < badge.targetNumToUnlock,
  //           },
  //           { transaction },
  //         );
  //       }

  //       if (userBadge.lock === false) {
  //         return userBadge;
  //       }

  //       const newProgress = userBadge.progress + 1;

  //       await userBadge.update(
  //         {
  //           progress: newProgress,
  //           lock: newProgress >= badge.targetNumToUnlock ? false : userBadge.lock,
  //         },
  //         { transaction },
  //       );

  //       return userBadge;
  //     });
  //   }
}
