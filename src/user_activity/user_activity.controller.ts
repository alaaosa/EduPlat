import { Controller, Get, Req } from '@nestjs/common';
import { UserActivityService } from './user_activity.service';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import type { Request } from 'express';

@Controller('user-activity')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @Auth(UserRoles.USER)
  @Get()
  getUserActivity(@Req() req: Request) {
    return this.userActivityService.getUserActivity(req.user.id);
  }
}
