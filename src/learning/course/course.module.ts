import { Module } from '@nestjs/common';
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
import { DeleteRejectedCourseReasons } from './infrastructure/job/schedule/delete-rejected-reason';
import { EVENT_EMITTER2 } from './domain/consts';
import { PushCourseEvent } from './infrastructure/event-emitter';
import { Course } from './infrastructure/persistence/models/course.entity';
import { CourseAudience } from './infrastructure/persistence/models/course_items/course.audience';
import { CourseGoal } from './infrastructure/persistence/models/course_items/course.goal';
import { CourseRequirement } from './infrastructure/persistence/models/course_items/course.requirements';
import { CourseReject } from './infrastructure/persistence/models/course.reject';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Course,
      CourseAudience,
      CourseGoal,
      CourseRequirement,
      CourseReject,
      Section,
    ]),
    AssessmentModule,
    InstructerModule,
    PaymentModule,
    MeilisearchModule,
    EnrollmentModule,
  ],
  controllers: [CourseController, SectionController],
  providers: [
    CourseService,
    SectionService,
    SectionRepository,
    DeleteRejectedCourseReasons,
    {
      provide: EVENT_EMITTER2,
      useClass: PushCourseEvent,
    },
  ],
})
export class CourseModule {}
