import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TempUser } from './entities/temp-user';
import { AdminRepository } from './repo/admin.repo';
import { TempUserRepository } from './repo/temp-user';
import { HandleException } from '../db/db.service';
import { EmailProvider } from '../common/providers/email.provider';
import { MeilisearchModule } from '../meilisearch/meilisearch.module';

@Module({
  imports: [SequelizeModule.forFeature([TempUser]), MeilisearchModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, TempUserRepository, HandleException, EmailProvider],
})
export class AdminModule {}
