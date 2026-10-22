import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HandleException } from '../../db/db.service';
import { Video } from '../../lesson/models/types/video.model';
import { CourseProgressService } from './application/course-progress.service';
import { CourseProgressRepository } from './infrastructure/persistence/sequelize/course-progress.repo';
import { CourseRepository } from './infrastructure/persistence/sequelize/course.repo';
import { CourseAudience } from './infrastructure/persistence/models/course_items/course.audience';
import { CourseGoal } from './infrastructure/persistence/models/course_items/course.goal';
import { CourseRequirement } from './infrastructure/persistence/models/course_items/course.requirements';
import { Course } from './infrastructure/persistence/models/course.entity';
import { CourseReject } from './infrastructure/persistence/models/course.reject';
import { Progress } from './infrastructure/persistence/models/progress';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Course,
      CourseAudience,
      CourseGoal,
      CourseRequirement,
      CourseReject,
      Progress,
      Video,
    ]),
  ],
  providers: [
    CourseProgressService,
    CourseProgressRepository,
    CourseRepository,
    HandleException,
  ],
  exports: [CourseProgressService, CourseRepository],
})
export class CourseProgressModule {}
