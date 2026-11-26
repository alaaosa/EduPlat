import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class RedisCourse {
  constructor(private readonly redisService: RedisService) {}
  private readonly logger = new Logger(RedisCourse.name);
  async getIsEnrolled(userId: number, courseId: number) {
    const isEnrolled = await this.redisService.client
      .get(`enrolled:${userId.toString()}:${courseId.toString()}`)
      .catch((err) => {
        this.logger.error('get enroll case is fail');
        return null;
      });

    return isEnrolled;
  }
  async setIsEnrolled(userId: number, courseId: number) {
    await this.redisService.client
      .set(
        `enrolled:${userId.toString()}:${courseId.toString()}`,
        'true',
        'EX',
        24 * 60 * 60 * 7,
        'NX',
      )
      .catch((err) => {
        this.logger.error('get enroll case is fail');
      });
  }
}
