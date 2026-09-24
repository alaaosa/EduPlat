import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StreakService } from './streak.service';

@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

 
}
