import { Injectable } from '@nestjs/common';
import { LeaderboardRepository } from './repo/leaderboard.repo';
import { LeaderboardDTO } from './dto/leaderboard.dto';
import { RedisService } from 'src/redis/redis.service';
import { LeaderboardKeys } from '../shared/const/leaderboard.const';
import { UserRepository } from 'src/user/repo/user';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly redisService: RedisService,
    private readonly userRepository: UserRepository,
  ) {}

  async updateLeaderboard(dto: LeaderboardDTO) {
    const { userId, xp } = dto;

    await this.leaderboardRepository.findAndUpdateOrCreate(userId, xp);

    await this.redisService.client.zincrby(
      LeaderboardKeys.GLOBAL,
      xp,
      userId.toString(),
    );
  }

  async getLeaderboardUsers() {
    const users = await this.redisService.client.zrevrange(
      LeaderboardKeys.GLOBAL,
      0,
      4,
      'WITHSCORES',
    );

    const ids: number[] = [];

    for (let index = 0; index < users.length; index += 2) {
      ids.push(Number(users[index]));
    }

    const usersData = await this.userRepository.findNames(ids);

    const userMap = new Map(usersData.map((user) => [user.id, user.name]));

    const leaderboard_users: {
      user_name: string;
      xp: number;
      level: number;
    }[] = [];

    for (let index = 0; index < users.length; index += 2) {
      const userId = Number(users[index]);
      const xp = Number(users[index + 1]);

      leaderboard_users.push({
        user_name: userMap.get(userId)!,
        xp,
        level: Math.floor((-100 + Math.sqrt(10000 + 100 * xp)) / 50) + 1,
      });
    }

    return leaderboard_users;
  }

  async getRankOfUser(userId: number) {
    const [rank, xp] = await Promise.all([
      this.redisService.client.zrevrank(
        LeaderboardKeys.GLOBAL,
        userId.toString(),
      ),
      this.redisService.client.zscore(
        LeaderboardKeys.GLOBAL,
        userId.toString(),
      ),
    ]);

    const position = rank !== null ? rank + 1 : null;
    const level =
      xp !== null
        ? Math.floor((-100 + Math.sqrt(10000 + 100 * Number(xp))) / 50) + 1
        : null;

    return { position, level };
  }
  getLevel(totalXp: number): number {
    return Math.floor((-100 + Math.sqrt(10000 + 100 * totalXp)) / 50) + 1;
  }
}
