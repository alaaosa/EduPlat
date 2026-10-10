import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CourseService } from './services/course.service';
import { CourseController } from './controller/course.controller';
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
import { CourseProgressModule } from './progress/course-progress.module';
import { Video } from 'src/lesson/models/types/video.model';
import { Quiz } from 'src/assessment2/quiz/entities/quiz.entity';

@Module({
  imports: [
    InterceptorModule,
    SequelizeModule.forFeature([
      Course,
      Section,
      CourseRequirement,
      CourseGoal,
      CourseAudience,
      Video,
      Quiz,
    ]),
    LessonModule,
    CertificateModule,
    FinalModule,
    QuizModule,
    EnrollmentModule,
    CouponModule,
    ReviewModule,
    CourseProgressModule,
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
})
export class CourseModule {}
