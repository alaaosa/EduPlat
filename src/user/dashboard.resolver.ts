import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { AuthGuard } from 'src/common/guard/auth.guard';
import {
  StudentDashboardResult,
  StudentDashboardService,
} from './dashboard.service';

@Resolver()
export class DashboardResolver {
  constructor(private readonly dashboardService: StudentDashboardService) {}

  @UseGuards(AuthGuard)
  @Query('studentDashboard')
  studentDashboard(
    @Context('req') request: Request,
  ): Promise<StudentDashboardResult> {
    return this.dashboardService.getDashboard(request.user.id);
  }
}
