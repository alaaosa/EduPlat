import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AttemptService } from './application/attempt.service';
import { ExamService } from './application/exam.service';
import { GradeService } from './application/grade.service';
import { Ownership } from './domain/policy/ownership';
import { AttemptRepository } from './infrastructure/repo/attempt';
import { ExamRepository } from './infrastructure/repo/exam.repo';
import { GradeRepository } from './infrastructure/repo/grade';
import { ExamWorker } from './infrastructure/bullMQ/worker';
import { HandleStudentAnswer } from './presentation/ws-gateway/handle-student-answer';
import { Exam } from './infrastructure/model/exam';
import { Attempt } from './infrastructure/model/attempt';
import { Mcq_TF_Question } from './infrastructure/model/question';
import { Mcq_TF_Answer } from './infrastructure/model/answer';
import { Grade } from './infrastructure/model/grade';
import { StudentAnswer } from './infrastructure/model/student-answer';
import { Lesson } from '../lesson/models/lesson.model';
import { LessonRepository } from '../lesson/repo/lesson.repo';
import { CourseProgressModule } from '../learning/course/course-progress.module';
import { HandleException } from '../db/db.service';
import { Section } from '../learning/course/infrastructure/persistence/models/section.entity';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Exam,
      Attempt,
      Mcq_TF_Question,
      Mcq_TF_Answer,
      Grade,
      StudentAnswer,
      Lesson,
      Section,
    ]),
    CourseProgressModule,
    EnrollmentModule,
  ],
  providers: [
    AttemptService,
    ExamService,
    GradeService,
    Ownership,
    AttemptRepository,
    ExamRepository,
    GradeRepository,
    ExamWorker,
    HandleStudentAnswer,
    LessonRepository,
    HandleException,
  ],
  exports: [ExamService, ExamRepository, AttemptService, GradeService],
})
export class AssessmentModule {}
