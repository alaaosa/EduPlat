import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OTPRepository } from './repo/otp';
import {
  ChangeEmailDTO,
  createUserPhotoDTO,
  DeleteUserPhotoDTO,
  UserDataDTO,
  VerifyEmailDTO,
} from './dto/user.dto';
import { UserRepository } from './repo/user';
import { CloudinaryService } from 'src/interceptor/service/cloudinary.service';
import { InjectQueue } from '@nestjs/bullmq';
import { queueNames } from 'src/common/queue';
import { Queue } from 'bullmq';
import { EmailProvider } from 'src/common/providers/email.provider';
import { UserJobs } from './shared/const/user.job';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cloudinaryService: CloudinaryService,
    @InjectQueue(queueNames.USER) private readonly userQueue: Queue,
    private readonly otpRepository: OTPRepository,
    private readonly emailProvider: EmailProvider,
  ) {}

  async update(userId: number, data: UserDataDTO) {
    const [user] = await this.userRepository.updateUser(userId, data);

    return user;
  }

  // check MIME TYPE
  // CHECK SIZE
  // IF THE FILE IS DANGER OR NOT => USE SHARP

  async uploadUserPhoto(userId: number, dto: createUserPhotoDTO) {
    await this.userRepository.updateUserPhoto(userId, {
      profilePictureId: dto.image.public_id,
      profilePictureUrl: dto.image.url,
    });
    return true;
  }

  async deleteUserPhoto(dto: DeleteUserPhotoDTO, userId: number) {
    // test here : if public_id not correct
    await this.cloudinaryService.delete(dto.image.public_id).catch((err) => {
      throw new BadRequestException("can't delete the photo");
    });

    // add worker here to retey do this job if it is fails. later
    await this.userRepository.deleteUserPhoto(userId).catch(async (err) => {
      this.logger.error("can't delete the user photo ");
      await this.userQueue
        .add(
          UserJobs.DELETE_PROFILE_PHOTO,
          { userId },
          {
            jobId: `delete-user-photo:${userId}`,
            attempts: 5,
            removeOnComplete: true,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        )
        .catch((err) => {
          this.logger.error("can't write the job on queue");
          throw err;
        });
      throw err;
    });
  }

  async updateUserPhoto(userId: number, profilePictureUrl: string) {
    return this.userRepository.updateUserPhotoUrl(userId, profilePictureUrl);
  }

  // email/change-request
  async changeEmail(userId: number, dto: ChangeEmailDTO) {
    const user = await this.userRepository.changeEmail(userId);

    if (!user || user.email !== dto.currentEmail)
      throw new NotFoundException('user not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.otpRepository.create(
      {
        otp,
        isUsed: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      userId,
    );

    await this.emailProvider.send({
      to: user.email,
      subject: 'Verify your email',
      text: `Your verification code is ${otp}`,
    });

    return true;
  }

  async verifyEmail(userId: number, dto: VerifyEmailDTO) {
    const findOTP = await this.otpRepository.verifyEmail(userId);

    if (!findOTP || findOTP.expiresAt.getTime() < Date.now())
      throw new BadRequestException('otp not available');

    if (dto.otp !== findOTP.otp) throw new ForbiddenException("doesn't match");

    findOTP.isUsed = true;

    await findOTP.save();

    return true;
  }

  @Cron('0 0 * * *')
  async deleteExpired() {
    await this.otpRepository.deleteExpired();
  }


  

}
