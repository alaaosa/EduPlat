import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Leaderboard } from '../entities/leaderboard.entity';
import { CreationAttributes, Sequelize, Transaction } from 'sequelize';
import { HandleException } from 'src/db/db.service';

@Injectable()
export class LeaderboardRepository {
  constructor(
    @InjectModel(Leaderboard)
    private readonly leadertboardModel: typeof Leaderboard,
    private readonly exceptionHandler: HandleException,
    @InjectConnection() private sequelize: Sequelize,
  ) {}
  saveXP(
    data: Omit<CreationAttributes<Leaderboard>, 'userId'>,
    userId: number,
  ) {
    return this.exceptionHandler.handle(async () =>
      this.leadertboardModel.create({ ...data, userId }),
    );
  }

  findAndUpdateOrCreate(userId: number, xp: number) {
    return this.exceptionHandler.handle(async () => {
      return this.sequelize.transaction(async (transaction) => {
        const [leaderboard, created] =
          await this.leadertboardModel.findOrCreate({
            where: { userId },
            defaults: {
              userId,
              xp_rank: xp,
              xp_using: xp,
            },
            transaction,
            lock: transaction?.LOCK.UPDATE,
          });

        if (!created) {
          const new_xp_rank = leaderboard.xp_rank + xp;
          const new_xp_using = leaderboard.xp_using + xp;
          await leaderboard.update(
            { xp_rank: new_xp_rank, xp_using: new_xp_using },
            { transaction },
          );
        }

        return leaderboard;
      });
    });
  }
}
