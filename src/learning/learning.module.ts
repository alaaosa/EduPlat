import { Module } from '@nestjs/common';
import { CourseModule } from './course/course.module';
import { AssessmentModule } from './assessment/assessment.module';
import { ReviewModule } from '../review/review.module';
import { EnrollmentModule as PaymentEnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    CourseModule,
    PaymentEnrollmentModule,
    AssessmentModule,
    ReviewModule,
  ],
  providers: [],
  exports: [],
})
export class LearningModule {}
