import { Module } from '@nestjs/common';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { ProgressModule } from './progress/progress.module';
import { AssessmentModule } from './assessment/assessment.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [CoursesModule, EnrollmentModule, ProgressModule, AssessmentModule, ReviewModule],
  providers: [],
  exports: [],
})
export class LearningModule {}
