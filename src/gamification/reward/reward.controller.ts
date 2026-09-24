import { Body, Controller, Post, Req } from '@nestjs/common';
import { RewardService } from './reward.service';
import { RewardDto } from './dto/reward.dto';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import type { Request } from 'express';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Auth(UserRoles.ADMIN)
  @Post()
  create(@Body() dto: RewardDto, @Req() req: Request) {
    return this.rewardService.create(dto, req.user.id);
  }
}
