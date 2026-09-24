import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard';
import { RoleGuard } from '../guard/role.guard';
import { Role } from './role';

export function Auth(...roles: string[]) {
  return applyDecorators(Role(...roles), UseGuards(AuthGuard, RoleGuard));
}
