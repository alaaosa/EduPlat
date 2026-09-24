import { IsEmail, IsString } from 'class-validator';

export class AuthDTO {
  @IsString()
  declare name: string;

  @IsEmail()
  declare email: string;

  @IsString()
  declare password: string;

  @IsString()
  declare repassword: string;
}

export class LoginDTO {
  @IsEmail()
  declare email: string;
  @IsString()
  declare password: string;
}
