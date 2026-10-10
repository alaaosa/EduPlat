import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InstructerRepository } from './repo/instructor';
import { comparePassword, hashPassword } from 'src/common/security/hash';
import { UserRepository } from 'src/user/repo/user';
import { CreateInstructerDTO, UpdatePasswordDTO } from './dto/instructor.dto';
type Handler =
  | ((instructerId: number) => Promise<any>)
  | Record<string, (instructerId: number) => Promise<any>>;
@Injectable()
export class InstructerService {
  constructor(
    private readonly instructorRepository: InstructerRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private get: Record<string, Handler> = {
    dashboard: this.getInstructerDataDashboard.bind(this),
    courses: this.getAllCoursesByInstructerId.bind(this),
    analytics: this.getInstructerAnalytics.bind(this),
    revenue: this.getRevenueByInstructerId.bind(this),
    reviews: this.getReviewsByInstructerId.bind(this),
    settings: {
      profile: this.getProfileDataByInstructerId.bind(this),
      notification: this.getNotificationSettingsByInstructerId.bind(this),
      security: this.getSecurtiyDetailsByInstructerId.bind(this),
      billing: this.getStripeAccountIdByInstructerId.bind(this),
    },
  };

  async becomeInstructer(instructerId: number, dto: CreateInstructerDTO) {
    const { uploadedFiles, ...details } = dto;

    const file = uploadedFiles.find((file) => file.type === 'file');
    const video = uploadedFiles.find((file) => file.type === 'video');

    if (!file || !video) throw new NotFoundException('attachment not found');

    const data = {
      ...details,
      CV_Id: file.public_id,
      videoId: video.public_id,
      CV_Url: file.url,
      videoUrl: video.url,
      isInstructer: false, // pendind untill the admin accept
    };

    const instructer = await this.instructorRepository.becomeInstructer(
      data,
      instructerId,
    );

    return instructer;
  }

  getInstructerData(instructerId: number, tab: string, subTab?: string) {
    const handler = this.get[tab];
    if (!handler) throw new NotFoundException('Tab Not Found');
    if (typeof handler === 'function') {
      return handler(instructerId);
    }

    if (!subTab) throw new NotFoundException('Sub Tab Not Found');

    const subHandler = handler[subTab];

    return subHandler(instructerId);
  }

  async checkCurrentPasswordByInstructerId(instructerId: number, pass: string) {
    const instructer =
      await this.instructorRepository.getCurrentPasswordByInstructerId(
        instructerId,
      );
    if (!instructer || !instructer.user.password)
      throw new NotFoundException('Instructer not found');

    const isPasswordMatch = comparePassword(pass, instructer.user.password);

    if (!isPasswordMatch) throw new ForbiddenException('Incorrect password');

    return true;
  }
  changePasswordByInstructerId(instructerId: number, dto: UpdatePasswordDTO) {
    const password = hashPassword(dto.newPassword);

    return this.userRepository.updatePassword(instructerId, password);
  }

  private async getInstructerDataDashboard(instructerId: number) {
    const instructerData =
      await this.instructorRepository.getInstructerDataDashboard(instructerId);
    if (!instructerData) throw new NotFoundException('Instructer not found');
    return instructerData;
  }

  private async getAllCoursesByInstructerId(instructerId: number) {
    const courses =
      await this.instructorRepository.findAllCoursesByInstructerId(
        instructerId,
      );
    if (!courses) throw new NotFoundException('Courses not found');
    return courses;
  }

  private async getInstructerAnalytics(instructerId: number) {
    const analytics =
      await this.instructorRepository.getInstructerStatesAnalytics(
        instructerId,
      );
    if (!analytics) throw new NotFoundException('Analytics not found');
    return analytics;
  }
  private async getRevenueByInstructerId(instructerId: number) {
    const revenue =
      await this.instructorRepository.getRevenueByInstructerId(instructerId);
    if (!revenue) throw new NotFoundException('Revenue not found');
    return revenue;
  }

  private async getReviewsByInstructerId(instructerId: number) {
    const reviews =
      await this.instructorRepository.getReviewsByInstructerId(instructerId);
    if (!reviews) throw new NotFoundException('Reviews not found');
    return reviews;
  }

  private async getProfileDataByInstructerId(instructerId: number) {
    const profileData =
      await this.instructorRepository.getProfileDataByInstructerId(
        instructerId,
      );
    if (!profileData) throw new NotFoundException('Profile data not found');
    return profileData;
  }

  private async getNotificationSettingsByInstructerId(instructerId: number) {
    const notificationSettings =
      await this.instructorRepository.getNotificationSettingsByInstructerId(
        instructerId,
      );
    if (!notificationSettings)
      throw new NotFoundException('Notification settings not found');
    return notificationSettings;
  }

  private async getSecurtiyDetailsByInstructerId(instructerId: number) {
    const securityDetails =
      await this.instructorRepository.getSecurtiyDetailsByInstructerId(
        instructerId,
      );
    if (!securityDetails)
      throw new NotFoundException('Security details not found');
    return securityDetails;
  }

  private async getStripeAccountIdByInstructerId(instructerId: number) {
    const stripeAccountId =
      await this.instructorRepository.getStripeAccountIdByInstructerId(
        instructerId,
      );
    if (!stripeAccountId)
      throw new NotFoundException('Stripe account not reachable');
    return stripeAccountId;
  }
}
