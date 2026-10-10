import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Attempt } from './models/attempt';
import { StudentAnswer } from './models/MCQ&TF/student.answer';
import { Mcq_TF_Question } from './models/MCQ&TF/question';
import { Mcq_TF_Answer } from './models/MCQ&TF/answer';
import { Grade } from './models/MCQ&TF/grade';
import { Final } from './final/entities/final.entity';
import { Quiz } from './quiz/entities/quiz.entity';
import { AttemptRepository } from './repo/attempt.repo';
import { McqRepository } from './repo/mcq.repo';
import { FinalRepo } from './final/repo/final.repo';
import { QuizRepo } from './quiz/repo/quiz.repo';
import { McqService } from './strategies/mcq.service';
import { ExamTypeService } from 'src/common/services/examtype.service';
import { AssessmentService } from './assessment.service';
import { AssessmentGateway } from './gateway/wsocket';
import { AssessmentWorker } from './gateway/assessment.worker';
import { AssessmentRecoveryService } from './gateway/assessment.recovery.service';
import { AssessmentController } from './assessment.controller';
import { CourseProgressModule } from 'src/course/progress/course-progress.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Attempt,
      StudentAnswer,
      Mcq_TF_Question,
      Mcq_TF_Answer,
      Grade,
      Final,
      Quiz,
    ]),
    CourseProgressModule,
  ],
  controllers: [AssessmentController],
  providers: [
    AttemptRepository,
    McqRepository,
    FinalRepo,
    QuizRepo,
    McqService,
    ExamTypeService,
    AssessmentService,
    AssessmentGateway,
    AssessmentWorker,
    AssessmentRecoveryService,
  ],
  exports: [
    AttemptRepository,
    McqRepository,
    FinalRepo,
    QuizRepo,
    McqService,
    ExamTypeService,
    AssessmentService,
  ],
})
export class AssessmentModule {}
