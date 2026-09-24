import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StreakRepository } from './repo/streak.repo';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';

@Injectable()
export class StreakService {
  constructor(
    private readonly streakRepository: StreakRepository,
    @InjectConnection() private readonly sequlize: Sequelize,
  ) {}
  async create(userId: number) {
    return this.sequlize.transaction(async (transaction) => {
      const userStreak = await this.streakRepository.recordDailyActivity(
        userId,
        transaction,
      );

      return userStreak;
    });
  }
}
