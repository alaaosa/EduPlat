import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StreakService } from '../../gamification2/application/streak.service';

@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}
}
