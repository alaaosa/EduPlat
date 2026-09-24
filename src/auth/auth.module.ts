import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from 'src/common/security/token';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';
@Global()
@Module({
  imports:[UserModule , ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtService] ,
  exports: [TokenService , JwtService],
})
export class AuthModule {}
