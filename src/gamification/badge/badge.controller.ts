import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BadgeService } from './badge.service';

@Controller('badge')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}


}
