import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserRepository } from 'src/user/repo/user';
import { UserRoles } from '../enum';
import { CourseRepository } from 'src/learning/course/infrastructure/persistence/sequelize/course.repo';

type properties = {
  courseId: number;
  id: number;
};
@Injectable()
export class OwnerCourse implements CanActivate {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly courseRepo: CourseRepository,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest() as Request<properties>;

    const { courseId } = req.params;

    const userId = req.user.id;

    if (!courseId || !userId)
      throw new NotFoundException('some params not found');

    const owner = await this.courseRepo.ownerCourse(userId, courseId);

    if (!owner) throw new ForbiddenException('not allowed for you');

    return true;
  }
}
