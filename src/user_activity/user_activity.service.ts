import { Injectable } from '@nestjs/common';
import { GroupRepository } from 'src/community/group/repo/group.repo';
import { UserActivityRepository } from './repo/user_activity.repo';

@Injectable()
export class UserActivityService {
  constructor(
    private readonly userActivityRepository: UserActivityRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async getUserActivity(userId: number) {
    const [activity, groups] = await Promise.all([
      this.userActivityRepository.findByUserId(userId),
      this.groupRepository.findGroupNamesByUserId(userId),
    ]);

    return { ...activity, groups };
  }
}
