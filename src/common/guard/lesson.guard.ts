import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { EnrollmentRepository } from 'src/enrollment/repo/enrollment.repo';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserEnrolled implements CanActivate {
  private readonly logger = new Logger();
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly redisService: RedisService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request;

    const courseId = Number(req.params.courseId);

    if (!courseId) throw new NotFoundException('course Id not found ');
    const userId = Number(req.user.id);
    let isEnrolled =
      (await this.redisService.client
        .get(`enrolled:${userId.toString()}:${courseId.toString()}`)
        .catch((err) => {
          this.logger.error('get enroll case is fail');
          return null;
        })) === 'true';

    if (!isEnrolled) {
      isEnrolled = await this.enrollmentRepository.findByCourseIdAndUserId(
        courseId,
        userId,
      );
      if (!isEnrolled) throw new ForbiddenException('not allowed for you');

      await this.redisService.client
        .set(
          `enrolled:${userId.toString()}:${courseId.toString()}`,
          JSON.stringify(isEnrolled),
          'EX',
          7 * 24 * 60 * 60,
        )
        .catch((err) => {
          this.logger.error("can't write in cache");
        }); // set userId in redis for 7 days
    }
    return true;
  }
}
