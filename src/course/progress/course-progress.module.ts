import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Attempt } from 'src/assessment2/models/attempt';
import { StudentAnswer } from 'src/assessment2/models/MCQ&TF/student.answer';
import { Quiz } from 'src/assessment2/quiz/entities/quiz.entity';
import { Course } from '../entities/course.entity';
import { Progress as CourseProgress } from '../entities/progress';
import { Section } from '../entities/section.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentRepository } from '../enrollment/repo/enrollment.repo';
import { Lesson } from 'src/lesson/models/lesson.model';
import { Video } from 'src/lesson/models/types/video.model';
import { Progress as VideoProgress } from 'src/lesson/models/lesson.user';
import { AttemptRepository } from 'src/assessment2/repo/attempt.repo';
import { VideoRepository } from 'src/lesson/repo/video.repo';
import { HandleException } from 'src/db/db.service';
import { CourseProgressService } from './course-progress.service';
import { User } from 'src/user/entities/user.entity';
import { CourseRequirement } from '../entities/course_items/course.requirements';
import { CourseGoal } from '../entities/course_items/course.goal';
import { CourseAudience } from '../entities/course_items/course.audience';
import { CourseReject } from '../entities/course.reject';
import { Review } from '../review/entities/review.entity';
import { Final } from 'src/assessment2/final/entities/final.entity';
import { LessonRepository } from 'src/lesson/repo/lesson.repo';
import { CourseRepository } from '../repo/course.repo';
import { CourseProgressRepository } from '../repo/course-progress.repo';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Course,
      CourseProgress,
      Section,
      Lesson,
      Video,
      VideoProgress,
      Quiz,
      Enrollment,
      Attempt,
      StudentAnswer,
      User,
      CourseRequirement,
      CourseGoal,
      CourseAudience,
      CourseReject,
      Review,
      Final,
    ]),
  ],
  providers: [
    HandleException,
    EnrollmentRepository,
    VideoRepository,
    AttemptRepository,
    LessonRepository,
    CourseRepository,
    CourseProgressRepository,
    CourseProgressService,
  ],
  exports: [
    CourseProgressService,
    EnrollmentRepository,
    LessonRepository,
  ],
})
export class CourseProgressModule {}
