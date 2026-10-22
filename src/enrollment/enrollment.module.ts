import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentRepository } from './repo/enrollment.repo';
import { HandleException } from '../db/db.service';

@Module({
  imports: [SequelizeModule.forFeature([Enrollment])],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, EnrollmentRepository, HandleException],
  exports: [EnrollmentRepository],
})
export class EnrollmentModule {}
