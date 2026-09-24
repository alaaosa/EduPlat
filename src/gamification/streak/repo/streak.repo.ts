import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Streak } from '../entities/streak.entity';
import { HandleException } from 'src/db/db.service';
import { formatInTimeZone } from 'date-fns-tz';
import { subDays } from 'date-fns';
import { Transaction } from 'sequelize';
@Injectable()
export class StreakRepository {
  constructor(
    @InjectModel(Streak) private readonly streakModel: typeof Streak,
    private readonly exceptionHandler: HandleException,
  ) {}

  async recordDailyActivity(userId: number, transaction: Transaction) {
    return this.exceptionHandler.handle(async () => {
      const today = formatInTimeZone(new Date(), 'Africa/Cairo', 'yyyy-MM-dd');
      const streak = await this.streakModel.findOne({
        where: { userId },
        transaction,
        lock: transaction ? transaction.LOCK.UPDATE : undefined,
      });

      if (!streak) {
        await this.streakModel.create(
          {
            userId,
            lastActivityDate: today,
            currentStreak: 1,
            longestStreak: 1,
          },
          { transaction },
        );
      }

      if (streak!.lastActivityDate === today) {
        return streak;
      }

      const yesterday = formatInTimeZone(
        subDays(new Date(), 1),
        'Africa/Cairo',
        'yyyy-MM-dd',
      );

      if (streak!.lastActivityDate === yesterday) {
        streak!.currentStreak += 1;

        streak!.longestStreak = Math.max(
          streak!.longestStreak,
          streak!.currentStreak,
        );
      } else {
        streak!.currentStreak = 1;
      }

      streak!.lastActivityDate = today;

      await streak!.save({ transaction });
    });
  }


}
