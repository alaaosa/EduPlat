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
import { AuthDTO, LoginDTO, OtpDTO } from './dto/auth';

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
  activate(@Body() dto: OtpDTO) {
    return this.authService.activateAccount(dto);
  }
}
