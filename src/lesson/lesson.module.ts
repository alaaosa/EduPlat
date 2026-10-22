import { forwardRef, Module } from '@nestjs/common';
import { LessonService } from './services/lesson.service';
import { LessonController } from './lesson.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Lesson } from './models/lesson.model';
import { Video } from './models/types/video.model';
import { Progress } from './models/lesson.user';
import { LessonRepository } from './repo/lesson.repo';
import { VideoRepository } from './repo/video.repo';
import { VideoHandler } from './services/video.service';
import { LessonHandler } from './handler/lesson';
import { CourseProgressModule } from '../learning/course/course-progress.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { MuxModule } from '../mux/mux.module';
import { HandleException } from '../db/db.service';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Lesson, Video, Progress]),
    CourseProgressModule,
    AssessmentModule,
    EnrollmentModule,
    forwardRef(() => MuxModule),
  ],
  controllers: [LessonController],
  providers: [LessonService, LessonRepository, VideoRepository, VideoHandler, LessonHandler, HandleException],
  exports: [LessonRepository, VideoHandler],
})
export class LessonModule {}
