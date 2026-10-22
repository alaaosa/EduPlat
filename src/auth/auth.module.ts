import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from 'src/common/security/token';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { MeilisearchModule } from 'src/meilisearch/meilisearch.module';
@Global()
@Module({
  imports:[UserModule , MeilisearchModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtService, AuthGuard ,] ,
  exports: [TokenService , JwtService, AuthGuard],
})
export class AuthModule {}
