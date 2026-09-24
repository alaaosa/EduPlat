import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repo/user';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserSetting } from './entities/user.setting';
import { User } from './entities/user.entity';
import { OTP } from './entities/otp.entity';
import { OTPRepository } from './repo/otp';
import { HandleException } from 'src/db/db.service';
@Global()
@Module({
  imports: [SequelizeModule.forFeature([UserSetting, User, OTP])],
  controllers: [UserController],
  providers: [UserService, UserRepository, OTPRepository, HandleException],
  exports: [UserService, UserRepository, OTPRepository , HandleException],
})
export class UserModule {}
