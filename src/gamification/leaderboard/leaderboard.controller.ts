import { Controller, Get, Req } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import type { Request } from 'express';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  getLeaderboardUsers() {
    return this.leaderboardService.getLeaderboardUsers();
  }

  @Auth(UserRoles.USER)
  @Get('me/rank')
  getRankOfUser(@Req() req: Request) {
    return this.leaderboardService.getRankOfUser(req.user.id);
  }
}
