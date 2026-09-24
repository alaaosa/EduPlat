import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CourseService } from './services/course.service';
import { CourseController } from './course.controller';
import { CourseRepository } from './repo/course.repo';
import { LessonModule } from '../lesson/lesson.module';
import { Course } from './entities/course.entity';
import { Section } from './entities/section.entity';
import { InterceptorModule } from 'src/interceptor/interceptor.module';
import { CourseRequirement } from './entities/course_items/course.requirements';
import { CourseGoal } from './entities/course_items/course.goal';
import { CourseAudience } from './entities/course_items/course.audience';
import { CertificateModule } from './certificate/certificate.module';
import { FinalModule } from '../assessment2/final/final.module';
import { QuizModule } from '../assessment2/quiz/quiz.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { CouponModule } from './coupon/coupon.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    InterceptorModule,
    SequelizeModule.forFeature([
      Course,
      Section,
      CourseRequirement,
      CourseGoal,
      CourseAudience,
    ]),
    LessonModule,
    CertificateModule,
    FinalModule,
    QuizModule,
    EnrollmentModule,
    CouponModule,
    ReviewModule,
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
})
export class CourseModule {}
