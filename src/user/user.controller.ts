import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { EventEmitter2 } from 'eventemitter2';
import type { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get('me')
  async getMe(@Req() req: Request) {
    this.eventEmitter.emit('user.daily_activity', { userId: req.user.id });
  }
}
