import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { QueryTypes, Sequelize } from 'sequelize';
import { HandleException } from 'src/db/db.service';
import { PaymentRepository } from 'src/payment/infrastructure/repo/payment.repo';
import { AdminRepository } from './repo/admin.repo';
import { TempUserRepository } from './repo/temp-user';
import { TempUserDTO } from './dto/temp-user';
import { EmailProvider } from 'src/common/providers/email.provider';
import { MeilisearchService } from 'src/meilisearch/meilisearch.service';

type Handler = (() => Promise<any>) | Record<string, () => Promise<any>>;
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly tempUserRepo: TempUserRepository,
    private readonly emailProvider: EmailProvider,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  private adminDashboardRecord: Record<string, Handler> = {
    overview: this.getAdminDashboardOverview.bind(this),
    users: this.getLastRegisteredUsers.bind(this),
  };

  getAdminDashboardData(tab: string, subTab?: string) {
    const handler = this.adminDashboardRecord[tab];
    if (!handler) {
      this.logger.error(`No handler found for tab: ${tab}`);
      throw new NotFoundException(`No handler found for tab: ${tab}`);
    }

    if (typeof handler === 'function') {
      return handler();
    }
    if (!subTab)
      throw new NotFoundException(`SubTab is required for tab: ${tab}`);
    const subHandler = handler[subTab];

    return subHandler();
  }

  // must sent url in the email to the user to complete the registration
  /**
   *
   * !!!!!!!!!! complete this service
   */
  async createNewUser(dto: TempUserDTO) {
    const { email, role } = dto;
    const send = await this.emailProvider
      .send({
        to: email,
        subject: 'Welcome to EduPlat',
        text: `You have been invited to join EduPlat as a ${role}. Please click the link below to complete your registration.`,
        html: `<p>You have been invited to join EduPlat as a <strong>${role}</strong>. Please click the link below to complete your registration.</p>`,
      })
      .catch((error) => {
        this.logger.error(`Failed to send email to ${email}`, error);
        throw new BadRequestException(`Failed to send email to ${email}`);
      });
    if (send.rejected.length > 0 || send.accepted.length === 0) {
      this.logger.error(`Failed to send email to ${email}`);
      throw new BadRequestException(`Failed to send email to ${email}`);
    }

    await this.tempUserRepo.create({ ...dto, email_sended: true });

    return true;
  }

  private async getAdminDashboardOverview() {
    const [
      adminOverview,
      monthlyEarnings,
      monthlyStats,
      coursesByCategory,
      pendingCourses,
    ] = await Promise.all([
      this.adminRepo.getAdminDahboardOverview(),
      this.adminRepo.getMonthlyEarnings(),
      this.adminRepo.monthlyStatistics(),
      this.adminRepo.getCoursesStatisticsBasedCategory(),
      this.adminRepo.getPendingCourses(),
    ]).catch((error) => {
      this.logger.error('Error fetching admin dashboard data', error);
      throw new InternalServerErrorException(
        'Failed to fetch admin dashboard data',
      );
    });
    return {
      adminOverview,
      monthlyEarnings,
      monthlyStats,
      coursesByCategory,
      pendingCourses,
    };
  }
  private async getLastRegisteredUsers() {
    return this.adminRepo.getLastRegisteredUsers();
  }

  async searchUsers(query: string, role?: string, status?: string) {
    const filters: string[] = [];

    if (role) {
      filters.push(`role = "${role}"`);
    }

    if (status) {
      filters.push(`status = "${status}"`);
    }

    return this.meilisearchService.search('users', query, {
      filter: filters.length ? filters.join(' AND ') : undefined,
      limit: 5,
    });
  }
}
