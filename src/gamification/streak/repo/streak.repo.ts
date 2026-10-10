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
      const todaysActivity = await this.streakModel.findOne({
        where: { userId, date: today },
        transaction,
        lock: transaction ? transaction.LOCK.UPDATE : undefined,
      });
      if (todaysActivity) return todaysActivity;

      const yesterday = formatInTimeZone(
        subDays(new Date(), 1),
        'Africa/Cairo',
        'yyyy-MM-dd',
      );
      const latestActivity = await this.streakModel.findOne({
        where: { userId },
        attributes: ['date', 'currentStreak', 'longestStreak'],
        order: [['date', 'DESC']],
        transaction,
        lock: transaction ? transaction.LOCK.UPDATE : undefined,
      });
      const currentStreak =
        latestActivity?.date === yesterday
          ? latestActivity.currentStreak + 1
          : 1;
      const longestStreak = Math.max(
        latestActivity?.longestStreak ?? 0,
        currentStreak,
      );

      return this.streakModel.create(
        { userId, date: today, currentStreak, longestStreak },
        { transaction },
      );
    });
  }

  getCurrentStreak(userId: number) {
    return this.exceptionHandler.handle(async () => {
      const today = formatInTimeZone(new Date(), 'Africa/Cairo', 'yyyy-MM-dd');
      const yesterday = formatInTimeZone(
        subDays(new Date(), 1),
        'Africa/Cairo',
        'yyyy-MM-dd',
      );
      const latestActivity = await this.streakModel.findOne({
        where: { userId },
        attributes: ['date', 'currentStreak'],
        order: [['date', 'DESC']],
      });

      if (!latestActivity) return null;
      if (latestActivity.date !== today && latestActivity.date !== yesterday)
        return 0;
      return latestActivity.currentStreak;
    });
  }

}
