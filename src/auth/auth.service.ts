import {
  ConflictException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDTO, LoginDTO } from './dto/auth';
import { UserRepository } from 'src/user/repo/user';
import { UserRoles } from 'src/common/enum';
import * as crypto from 'crypto';
import { comparePassword, hashPassword } from 'src/common/security/hash';
import { EventEmitter2 } from 'eventemitter2';
import { userEvents } from 'src/common/events/user.event';
import { OTPRepository } from 'src/user/repo/otp';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenService } from 'src/common/security/token';
import { MeilisearchService } from 'src/meilisearch/meilisearch.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OTPRepository,
    private readonly event: EventEmitter2,
    private readonly tokenService: TokenService,
    @InjectConnection() private sequelize: Sequelize,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  async createUser(authDTO: AuthDTO) {
    const { name, email, password, repassword } = authDTO;

    const user = await this.userRepository.findByEmail(email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    if (password !== repassword) {
      throw new ConflictException('Passwords not matched');
    }

    const publicId = `STD-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    const newUser = await this.sequelize.transaction(async (transaction) => {
      const user = await this.userRepository.create(
        {
          name,
          email,
          password: hashPassword(password),
          role: UserRoles.USER,
          isActivited: false,
          publicId,
        },
        transaction,
      );

      await this.otpRepository.create(
        {
          otp: Math.floor(100000 + Math.random() * 900000).toString(),
          isUsed: false,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        user.id,
        transaction,
      );

      return user;
    });

    // CREATE TOKEN TO WRITE ON URL FOR ACTIVATION
    const tokenEmail = this.tokenService.sign(email, {
      secret: process.env.EMAIL,
    });

    this.event.emit(userEvents.USER_VERIFICATION, {
      userId: newUser.id,
      email,
      tokenEmail,
    });
    return newUser;
  }

  async login(loginDTO: LoginDTO) {
    const { email, password } = loginDTO;

    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new NotFoundException('not accurate account');

    if (!user.isActivited)
      throw new UnauthorizedException('activate your email');

    if (!comparePassword(password, user.password))
      throw new NotAcceptableException('not accurate account');

    const token = this.tokenService.sign(
      { id: user.id },
      { secret: process.env.EMAIL, expiresIn: '1h' },
    );

    return { user, token };
  }

  /// lllooooooooookkk hereeeeeeeeee

  async activateAccount(otp: string, email: string) {
    const user = await this.userRepository.findByEmail(email);
    const getOtp = await this.otpRepository.get(user!.id);

    if (!getOtp || !user) {
      throw new NotFoundException('Invalid otp number');
    }

    if (otp !== getOtp.otp || getOtp.expiresAt < new Date() || getOtp.isUsed) {
      // await this.otpRepository.delSpecificOtp(otp, userId); ==> if we used cron job
      throw new NotAcceptableException('OTP Not Accurate');
    }

    let isActiviated = 0;
    try {
      await this.sequelize.transaction(async (transaction) => {
        [isActiviated] = await this.userRepository.changeIsActivited(
          user.id,
          true,
          transaction,
        );
        await getOtp.destroy({ transaction });
      });

      const index = this.meilisearchService.getIndex('users');
      await index.updateDocuments([
        {
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString().split('T')[0],
          status: isActiviated > 0 ? 'active' : 'inactive',
          id: user.id,
        },
      ]);
      return true;
    } catch (error) {
      this.logger.error(`Failed to activate account for ${email}`, error);
      throw new NotAcceptableException('OTP Not Accurate');
    }
  }

  // @Cron(CronExpression.EVERY_10_MINUTES)
  // private async deleteExpiredOtps() {
  //   await this.otpRepository.deleteExpired();
  // }
}
