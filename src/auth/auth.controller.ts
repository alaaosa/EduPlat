import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO, LoginDTO } from './dto/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: AuthDTO) {
    return this.authService.createUser(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Post('activate')
  activate(@Body('otp') otp: string, @Body('email') email: string) {
    return this.authService.activateAccount(otp, email);
  }
}
