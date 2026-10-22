import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Auth(UserRoles.ADMIN)
  @Get('dashboard/overview/:tab')
  getAdminDashboardData(
    @Param('tab') tab: string,
    @Param('subTab') subTab?: string,
  ) {
    return this.adminService.getAdminDashboardData(tab);
  }
  @Auth(UserRoles.ADMIN)
  @Get('dashboard/overview/:tab/:subTab')
  getAdminDashboardDataWithSubTab(
    @Param('tab') tab: string,
    @Param('subTab') subTab?: string,
  ) {
    return this.adminService.getAdminDashboardData(tab, subTab);
  }
  @Auth(UserRoles.ADMIN)
  @Get('dashboard/users')
  searchUsers(@Query('q') query: string, @Query('role') role?: string) {
    return this.adminService.searchUsers(query, role);
  }
}
