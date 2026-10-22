import { Module } from '@nestjs/common';
import { CourseModule } from './course/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { ProgressModule } from './progress/progress.module';
import { AssessmentModule } from './assessment/assessment.module';
import { ReviewModule } from '../review/review.module';
import { EnrollmentModule as PaymentEnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [CourseModule, EnrollmentModule, PaymentEnrollmentModule, ProgressModule, AssessmentModule, ReviewModule],
  providers: [],
  exports: [],
})
export class LearningModule {}
