import { Module } from '@nestjs/common';
import { CourseProgressModule } from './course-progress.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { CourseController } from './presentation/controller/course.controller';
import { SectionController } from './presentation/controller/section.controller';
import { CourseService } from './application/course.service';
import { SectionService } from './application/section.service';
import { SectionRepository } from './infrastructure/persistence/sequelize/section.repo';
import { Section } from './infrastructure/persistence/models/section.entity';
import { AssessmentModule } from '../../assessment/assessment.module';
import { InstructerModule } from '../../instructer/instructer.module';
import { PaymentModule } from '../../payment/payment.module';
import { EnrollmentModule } from '../../enrollment/enrollment.module';
import { MeilisearchModule } from '../../meilisearch/meilisearch.module';
import { HandleException } from '../../db/db.service';
import { DeleteRejectedCourseReasons } from './infrastructure/job/schedule/delete-rejected-reason';

@Module({
  imports: [
    SequelizeModule.forFeature([Section]),
    CourseProgressModule,
    AssessmentModule,
    InstructerModule,
    PaymentModule,
    MeilisearchModule,
    EnrollmentModule,
  ],
  controllers: [CourseController, SectionController],
  providers: [CourseService, SectionService, SectionRepository, HandleException, DeleteRejectedCourseReasons],
  exports: [CourseProgressModule],
})
export class CourseModule {}
